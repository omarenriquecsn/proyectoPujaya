import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @ApiOperation({ summary: 'Crear producto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          nullable: true,
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Imagen en formato JPG, PNG o WEBP',
        },
        name: {
          description: 'Debes ingresar el nombre del producto',
          example: 'Dodge Dard 1971',
        },
        description: {
          description: 'Debes ingresar el detalle del producto',
          example: 'Dodge Dard 1971',
        },
        initialPrice: {
          description: 'Debes ingresar el monto inicial de la subasta',
          example: 200,
        },
        finalPrice: {
          description: 'Debes ingresar el monto inicial de la subasta',
          example: 200,
        },
        category: {
          type: 'array',
          description: 'Debes ingresar categorias',
          example: ['Carros Usados', 'Dodge'],
        },
      },
      required: ['name', 'description', 'initialPrice', 'finalPrice'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 3))
  @Post()
  create(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto, files);
  }

  @ApiOperation({ summary: 'Obtener productos paginados' })
  @Get()
  findAll(@Query('limit') limit: number, @Query('page') page: number) {
    return this.productsService.findAll(!limit ? 9 : limit, !page ? 1 : page);
  }

  @ApiOperation({ summary: 'Obtener producto por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar productos por ID' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiOperation({ summary: 'Inactivar producto por ID' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 5, { limits: { fileSize: 1024 * 1024 * 5 } })) // hasta 5 imágenes
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          format: 'binary',
          description: 'Imagen en formato JPG, PNG o WEBP',
        },
      },
      required: ['file'],
    },
  })
  async uploadImages(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    console.log('--- [BACKEND] /products/upload llamado ---');
    if (!files || files.length === 0) {
      console.error('No se recibió ningún archivo en el endpoint');
      throw new BadRequestException('No files received');
    }
    console.log(
      'Archivos recibidos en el endpoint:',
      files.map((f) => ({
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      })),
    );
    const results = await Promise.all(
      files.map((file) => this.productsService.uploadImage(file)),
    );
    const urls = results.map((r) => r?.secure_url).filter(Boolean);
    if (urls.length === 0) {
      throw new BadRequestException('No fue posible cargar las imágenes');
    }
    return { urls };
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen en formato JPG, PNG o WEBP',
        },
      },
    },
  })
  async uploadSingleImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const img = await this.productsService.uploadImage(file);
    return img?.secure_url;
  }
}
