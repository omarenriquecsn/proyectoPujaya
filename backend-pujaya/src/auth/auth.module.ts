import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { EmailService } from 'src/emailService/emailService.service';
import { FirebaseAuthGuard } from './guards/auth.guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    FirebaseAuthGuard
  ],
  exports: [AuthService, FirebaseAuthGuard]
})
export class AuthModule {}
