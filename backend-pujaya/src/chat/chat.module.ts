import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { UsersModule } from '../users/users.module';
import { BidsModule } from '../bids/bids.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { ChatController } from './chat.controller';
import { User } from '../users/entities/user.entity';
import { Auction } from '../auctions/entities/auction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, User, Auction]),
    UsersModule,
    BidsModule,
    AuctionsModule,
  ],
  providers: [
    // ChatGateway, // Comentado temporalmente por migración a Pusher
    ChatService,
  ],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
