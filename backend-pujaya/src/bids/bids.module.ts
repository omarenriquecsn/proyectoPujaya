import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { BidsRepository } from './bids.repository';
import { Bid } from './entities/bid.entity';
import { Auction } from '../auctions/entities/auction.entity';
import { AuctionsRepository } from '../auctions/auctions.repository';
import { EmailService } from '../emailService/emailService.service';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { AuctionsModule } from '../auctions/auctions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Auction]),
    UsersModule,
    ProductsModule,
    AuctionsModule,
    TypeOrmModule,
  ],
  controllers: [BidsController],
  providers: [BidsService, BidsRepository, AuctionsRepository, EmailService],
  exports: [BidsService],
})
export class BidsModule {}
