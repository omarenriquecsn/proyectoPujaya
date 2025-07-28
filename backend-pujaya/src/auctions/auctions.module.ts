import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { Auction } from './entities/auction.entity';
import { Product } from 'src/products/entities/product.entity';
import { AuctionsRepository } from './auctions.repository';
import { EmailService } from 'src/emailService/emailService.service';
import { Bid } from 'src/bids/entities/bid.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Product, Bid]),
    UsersModule,
    ProductsModule,
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsRepository, EmailService],
  exports: [AuctionsService, AuctionsRepository, TypeOrmModule],
})
export class AuctionsModule {}
