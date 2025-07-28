import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './types/roles';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de perfil del usuario',
        },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'Password123-' },
        confirmPassword: { type: 'string', example: 'Password123-' },
        phone: { type: 'string', example: '1234567890' },
        country: { type: 'string', example: 'Colombia' },
        address: { type: 'string', example: 'Calle 123, Ciudad' },
      },
      required: [
        'name',
        'email',
        'password',
        'confirmPassword',
        'phone',
        'country',
        'address',
      ],
    },
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.create(createUserDto, file);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error to get users');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) throw new NotFoundException(`User with id ${id} not found`);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error to get user');
    }
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  // @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      if (!user) throw new NotFoundException(`User with id ${id} not found`);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error to update user');
    }
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) throw new NotFoundException(`User with id ${id} not found`);
      if (!user.isActive)
        return { message: `User with id ${id} is already deleted` };
      await this.usersService.remove(id);
      return { message: `User with id ${id} deleted` };
    } catch (error) {
      throw new InternalServerErrorException('Error to delete user');
    }
  }

  @Get('firebase/:uid')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  async findByFirebaseUid(@Param('uid') uid: string) {
    try {
      const user = await this.usersService.findByFirebaseUid(uid);
      if (!user) {
        throw new NotFoundException(`User with Firebase UID ${uid} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding user by Firebase UID');
    }
  }

  @Put('profile/image/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadProfileImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.usersService.uploadProfileImage(file, id);
    return { imageUrl };
  }
}
