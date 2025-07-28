import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from 'src/category/entities/category.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import * as bufferToStream from 'buffer-to-stream';
import { LessThan } from 'typeorm';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    urlFiles?: string[],
  ): Promise<Product> {
    const { categoryId, ...rest } = createProductDto;

    // Find the category
    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    let newProduct = this.productRepository.create(rest);
    newProduct.category = category;

    if (!newProduct) {
      throw new BadRequestException(
        'No ha sido creado el producto Ha ocurrido un error',
      );
    }

    if (urlFiles && urlFiles.length > 0) {
      newProduct.imgProduct = urlFiles;
    }

    await this.productRepository.save(newProduct);
    return newProduct;
  }

  async findAll(limit: number, page: number): Promise<Product[]> {
    const [data] = await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['category'],
    });
    if (!data) {
      throw new BadRequestException(
        'Error al solicitar los productos a la base de datos',
      );
    }
    return data;
  }

  async findOne(id: string): Promise<Product | BadRequestException> {
    const oneProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'auction'], // Add auction relation
    });
    if (!oneProduct) {
      return new BadRequestException('No existe un producto con ese id');
    }
    return oneProduct;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const oneProduct = await this.findOne(id);
    if (oneProduct instanceof Product) {
      const { categoryId, ...rest } = updateProductDto;

      // If categoryId is provided, update the category
      if (categoryId) {
        const category = await this.categoryRepository.findOneBy({
          id: categoryId,
        });
        if (!category) {
          throw new BadRequestException('Category not found');
        }
        (oneProduct as Product).category = category;
      }

      const oneProductUpdate: Product = { ...oneProduct, ...rest };
      await this.productRepository.save(oneProductUpdate);

      return oneProductUpdate;
    }

    throw new BadRequestException('No existe un producto con ese id');
  }

  async delete(id: string): Promise<string> {
    let product: Product | BadRequestException = await this.findOne(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    const deleteProduct = { ...product, isActive: false };
    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set(deleteProduct)
      .where({ id })
      .execute();
    return id;
  }

  async fileUpload(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | undefined> {
    console.log('fileUpload - file recibido:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    return new Promise((resolve, reject) => {
      const uploadFile = Cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(
              new BadRequestException(error.message || 'Hubo un problema'),
            );
          } else {
            console.log('Cloudinary upload result:', result);
            resolve(result);
          }
        },
      );
      try {
        bufferToStream(file.buffer).pipe(uploadFile);
      } catch (err) {
        console.error('Error al convertir buffer a stream:', err);
        reject(new BadRequestException('Error al procesar la imagen.'));
      }
    });
  }

  async count(): Promise<number> {
    return await this.productRepository.count();
  }

  async findOldInactiveProducts(dateLimit: Date): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        isActive: false,
        deactivatedAt: LessThan(dateLimit),
      },
    });
  }

  async deletePhysical(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }
}
