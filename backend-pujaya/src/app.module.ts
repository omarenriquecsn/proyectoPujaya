import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // <-- Agrega esto
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/typeorm';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuctionsModule } from './auctions/auctions.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { FirebaseModule } from './firebase-module/firebase-module.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import firebaseConfig from './config/firebase';
import { BidsModule } from './bids/bids.module';
import { PaymentsModule } from './payments/payments.module';
import stripeConfig from './config/stripe';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig, firebaseConfig, stripeConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const typeOrmConfig =
          configService.get<TypeOrmModuleOptions>('typeorm');
        if (!typeOrmConfig) {
          throw new Error('Fallo en la configuración de TypeORM');
        }
        return typeOrmConfig;
      },
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    ProductsModule,
    AuctionsModule,
    CategoryModule,
    AuthModule,
    ContactModule,
    FirebaseModule,
    AdminModule,
    BidsModule,
    PaymentsModule,
    ChatModule,
  ],
  controllers: [AdminController],
})
export class AppModule {}
