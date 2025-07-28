import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString } from "class-validator";
import { UserRole } from "src/users/types/roles";

export class AssingRoleDto {
    @ApiProperty({
        type: 'string',
        description: 'UID from firebase',
        example: 'psiTn2MfJPPvzXMZlLeY0Ah7XGh1'
    })
    @IsString()
    uid: string

    @ApiProperty({
        type: 'string',
        description: 'Role for user',
        example: 'admin'
    })
    @IsIn(['regular', 'premium', 'admin'])
    role:UserRole

}