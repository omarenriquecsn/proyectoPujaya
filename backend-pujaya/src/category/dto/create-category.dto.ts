import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateCategoryDto {
    @ApiProperty({
        required: true,
        description: 'Debe ingresar el nombre de la categoria',
        example: 'Computadora'

    })
    @IsNotEmpty()
    @IsString()
    categoryName: string
}
