import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateAuctionDto {
  @ApiProperty({
    required: true,
    description: 'Auction name',
    example: 'Dodge Dart 1971 Auction',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    description: 'Auction description',
    example: 'Classic car auction for a well-maintained Dodge Dart from 1971',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    required: true,
    description: 'Auction end date (ISO format)',
    example: '2025-06-01T23:59:59.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    required: false,
    description: 'Initial product ID to auction (optional)',
    example: 'uuid-producto',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({
    required: true,
    description: 'Latitude of the auction location',
    example: -34.6037,
  })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    required: true,
    description: 'Longitude of the auction location',
    example: -58.3816,
  })
  @IsNotEmpty()
  longitude: number;
}
