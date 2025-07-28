import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 1000, description: 'Monto en centavos (ej: 1000 = $10.00)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'usd', description: 'Moneda (ej: usd, eur)' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'annual'] })
  @IsEnum(['monthly', 'annual'])
  plan: 'monthly' | 'annual';

  @ApiProperty({ example: 'user-id-123', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
