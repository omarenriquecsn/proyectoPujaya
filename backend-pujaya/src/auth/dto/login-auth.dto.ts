import { ApiProperty } from '@nestjs/swagger'
import {
IsEmail,
IsNotEmpty,
IsString,
IsStrongPassword,
Matches,
MaxLength,
MinLength,
} from 'class-validator'


export class LoginUserDto {
    @ApiProperty({
    required: true,
    description: 'email - correo electronico del usuario',
    example: 'pepitoPerez@mail.com',
})
@IsNotEmpty()
@IsEmail()
email: string

@ApiProperty({
    required: true,
    description: 'contraseña - contraseña del usuario',
    example: 'pepitoPerez@mail.com',
})
@IsNotEmpty()
@IsString()
@MinLength(8)
@MaxLength(15)
@IsStrongPassword({
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
})
@Matches(/^[A-Za-z\d!@#$%^&*]+$/)
@Matches(/[A-Za-z\d!@#$%^&*]/)
password: string
}


