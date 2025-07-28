import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { EmailModule } from '../emailService/emailService.module';
import { FirebaseModule } from 'src/firebase-module/firebase-module.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule, FirebaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
