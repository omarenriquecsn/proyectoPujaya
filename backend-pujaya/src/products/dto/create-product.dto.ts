import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, IsUUID, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    required: true,
    description: 'Product name',
    example: 'Vintage Watch',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    description: 'Product description',
    example: 'Beautiful vintage watch in excellent condition...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    required: true,
    description: 'Initial price for the product',
    example: 100.00,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  initialPrice: number;

  @ApiProperty({
    required: true,
    description: 'Final price (reserve price) for the product',
    example: 500.00,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  finalPrice: number;

  @ApiProperty({
    required: true,
    description: 'Array of image URLs for the product',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  imgProduct: string[];

  @ApiProperty({
    required: true,
    description: 'Category ID for the product',
    example: 'uuid-category',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    required: false,
    description: 'Auction ID to associate this product with',
    example: 'uuid-auction',
  })
  @IsUUID()
  @IsOptional()
  auctionId?: string;
}
