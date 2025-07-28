import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'annual'] })
  @IsEnum(['monthly', 'annual'])
  plan: 'monthly' | 'annual';

  @ApiProperty({ example: 'cus_123456789' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'price_123456789' })
  @IsString()
  priceId: string;
}
