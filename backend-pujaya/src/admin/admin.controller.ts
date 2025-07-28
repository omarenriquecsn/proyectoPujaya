import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { AssingRoleDto } from './dto/adminDto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly usersService: UsersService){

    }

    @Post('assing-role')
    @ApiOperation({
        summary: 'Asigna un rol a un usuario por su UID'
    })
    async assignRole(@Body() assignRoleDto: AssingRoleDto) {
        try {
            await this.usersService.setUserRole(assignRoleDto.uid, assignRoleDto.role)
            return {message: 'Role assigned succefully'}
        } catch (error) {
            console.error('Error: role was not assigned', error.message);
            throw error
            
        }
    }
}
