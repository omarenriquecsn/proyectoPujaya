import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { FirebaseAuthGuard } from './guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('signin')
  // async signin(@Body() login: LoginUserDto) {
  //   return this.authService.signIn(login.email, login.password);
  // }

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  async signup(@Body() createUser: CreateUserDto & { firebaseUid: string }) {
    return this.authService.signUp(createUser);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Req() req) {
    // El usuario ya está validado por el guard y contiene la información correcta
    return req.user;
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('validate')
  @ApiOperation({ summary: 'Validate user token' })
  async validateToken(@Req() req) {
    // Devuelve el usuario validado
    return {
      isValid: true,
      user: req.user
    };
  }
}
