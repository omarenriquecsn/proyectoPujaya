import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(private productRepository: ProductsRepository) {}

  async create(
    createProductDto: CreateProductDto,
    files?: Express.Multer.File[],
  ) {
    let urlFiles: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const newUrl = await this.productRepository.fileUpload(file);

        if (!newUrl || !newUrl.secure_url) {
          throw new BadRequestException('No fue posible cargar las imagenes');
        }

        return newUrl.secure_url;
      });
      urlFiles = await Promise.all(uploadPromises);
    }
    return this.productRepository.createProduct(createProductDto, urlFiles);
  }

  findAll(limit, page) {
    return this.productRepository.findAll(limit, page);
  }

  findOne(id: string) {
    return this.productRepository.findOne(id);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: string) {
    return this.productRepository.delete(id);
  }

  async uploadImage(file: Express.Multer.File) {
    return this.productRepository.fileUpload(file);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldProducts() {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const dateLimit = new Date(Date.now() - ONE_DAY);
    const products =
      await this.productRepository.findOldInactiveProducts(dateLimit);
    for (const product of products) {
      await this.productRepository.deletePhysical(product.id);
    }
  }
}
