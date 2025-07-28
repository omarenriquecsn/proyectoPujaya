import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../types/roles';

export class CreateUserDto {
  @ApiProperty({
    required: true,
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    required: true,
    description: 'The email of the user',
    example: '2BdPd@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    description: 'The image profile of the user',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  imgProfile?: string;

  @ApiProperty({
    required: false,
    description: 'The phone number of the user',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    description: 'The country of the user',
    example: 'Colombia',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    required: false,
    description: 'The address of the user',
    example: 'Calle 123, Ciudad',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    required: true,
    description: 'The Firebase UID of the user',
    example: 'firebase-uid-123',
  })
  @IsNotEmpty()
  @IsString()
  firebaseUid: string;

  @ApiProperty({
    required: false,
    description: 'The role of the user',
    enum: UserRole,
    default: UserRole.REGULAR,
  })
  @IsOptional()
  role?: UserRole;

 
}