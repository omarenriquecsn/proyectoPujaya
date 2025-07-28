import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../auth/guards/auth.guard';
import { pusher } from '../config/pusher';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from '../auctions/entities/auction.entity';
import { User } from '../users/entities/user.entity';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Endpoint para obtener las conversaciones del owner autenticado
  @UseGuards(FirebaseAuthGuard)
  @Get('owner/conversations')
  async getOwnerConversations(@Req() req: Request) {
    const ownerId = (req as any).user?.id;
    if (!ownerId) throw new Error('No owner id found in request');
    const rawConvs = await this.chatService.getOwnerConversations(ownerId);
    console.log('Owner conversations:', rawConvs, 'OwnerId:', ownerId);
    // Map to frontend-friendly keys
    return rawConvs.map((conv: any) => ({
      auctionId: conv.auction_id,
      auctionTitle: conv.auction_name,
      bidderId: conv.bidder_id,
      bidderName: conv.bidder_name,
      room: conv.room,
      lastmessagetext: conv.lastMessageText,
      lastmessageat: conv.lastMessageAt,
    }));
  }

  // Endpoint para obtener las conversaciones del usuario autenticado (como owner o bidder)
  @UseGuards(FirebaseAuthGuard)
  @Get('user/conversations')
  async getUserConversations(@Req() req: Request) {
    const userId = (req as any).user?.id;
    if (!userId) throw new Error('No user id found in request');
    const rawConvs = await this.chatService.getUserConversations(userId);
    // Map to frontend-friendly keys
    return rawConvs.map((conv: any) => ({
      auctionId: conv.auction_id,
      auctionTitle: conv.auction_name,
      otherUserId: conv.other_user_id,
      otherUserName: conv.other_user_name,
      room: conv.room,
      lastmessagetext: conv.lastMessageText,
      lastmessageat: conv.lastMessageAt,
    }));
  }

  // Endpoint para enviar un mensaje
  @UseGuards(FirebaseAuthGuard)
  @Post('send')
  async sendMessage(@Req() req: Request, @Body() body: any) {
    const senderId = (req as any).user?.id;
    if (!senderId) throw new Error('No sender id found in request');
    const { auctionId, receiverId, text, room } = body;
    // Buscar entidades necesarias
    const [auction, sender, receiver] = await Promise.all([
      this.auctionRepository.findOne({ where: { id: auctionId } }),
      this.userRepository.findOne({ where: { id: senderId } }),
      this.userRepository.findOne({ where: { id: receiverId } }),
    ]);
    if (!auction || !sender || !receiver) throw new Error('Invalid data');
    // Guardar mensaje
    const saved = await this.chatService.saveMessage({
      auction,
      sender,
      receiver,
      text,
      room,
    });
    // Emitir por Pusher
    await pusher.trigger(room, 'message', {
      sender: sender.name,
      senderId: sender.id,
      receiverId: receiver.id,
      text,
      createdAt: saved.createdAt,
    });
    return { success: true };
  }

  // Endpoint para obtener el historial de mensajes de un room
  @UseGuards(FirebaseAuthGuard)
  @Get('history')
  async getChatHistory(@Req() req: Request) {
    const room = req.query.room as string;
    if (!room) throw new Error('No room provided');
    const messages = await this.chatService.getMessagesByRoom(room);
    // Formatear mensajes para el frontend
    return Array.isArray(messages)
      ? messages.map((msg) => ({
          sender: msg.sender?.name || 'Unknown',
          senderId: msg.sender?.id,
          receiverId: msg.receiver?.id,
          text: msg.text,
          createdAt: msg.createdAt,
        }))
      : [];
  }
}

// Toda la lógica WebSocket/Socket.IO está comentada en chat.gateway.ts
