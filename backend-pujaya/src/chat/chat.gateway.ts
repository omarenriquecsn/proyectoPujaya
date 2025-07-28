// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
//   WebSocketServer,
//   OnGatewayInit,
// } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';
// import { chatGatewayConfig } from '../config/chat';
// import { UsersService } from '../users/users.service';
// import { BidsService } from '../bids/bids.service';
// import { UserRole } from '../users/types/roles';
// import { AuctionsService } from '../auctions/auctions.service';
// import * as admin from 'firebase-admin';
// import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
// import { ChatService } from './chat.service';
// import { Transport } from '@nestjs/microservices';

// @WebSocketGateway({
//   ...chatGatewayConfig,
//   transport: Transport.SOCKET_IO,
// })
// export class ChatGateway implements OnGatewayInit {
//   @WebSocketServer()
//   server: Server;

//   constructor(
//     private readonly usersService: UsersService,
//     private readonly bidsService: BidsService,
//     private readonly auctionsService: AuctionsService,
//     private readonly chatService: ChatService,
//   ) {}

//   afterInit(server: Server) {
//     // Optionally log or setup
//   }

//   @SubscribeMessage('joinRoom')
//   async handleJoinRoom(
//     @MessageBody()
//     data: {
//       room: string;
//       token: string;
//       auctionId: string;
//       targetUserId: string;
//     },
//     @ConnectedSocket() client: Socket,
//   ) {
//     try {
//       console.log('[ChatGateway] joinRoom recibido:', data);
//       if (!data.token) throw new UnauthorizedException('Token required');
//       // Verify Firebase token
//       const decoded = await admin.auth().verifyIdToken(data.token);
//       const user = await this.usersService.findByFirebaseUid(decoded.uid);
//       if (!user) throw new UnauthorizedException('User not found');

//       // Get auction and owner
//       const auction = await this.auctionsService.findOne(data.auctionId);
//       if (!auction) throw new ForbiddenException('Auction not found');
//       const isOwner = auction.owner.id === user.id;
//       // Check if user is owner or has at least one bid
//       const userBids = await this.bidsService.getBidsByAuction(data.auctionId);
//       const isBidder = userBids.some(
//         (bid) => bid.user && bid.user.id === user.id,
//       );

//       // LOGS PARA DEPURACION
//       console.log('--- WebSocket joinRoom attempt ---');
//       console.log('User ID:', user.id);
//       console.log('User role:', user.role);
//       console.log('Auction owner ID:', auction.owner.id);
//       console.log('Is owner:', isOwner);
//       console.log('Is bidder:', isBidder);
//       console.log('targetUserId:', data.targetUserId);
//       console.log('Room:', data.room);
//       // Only owner or bidder can join
//       if (!isOwner && !isBidder) throw new ForbiddenException('Not allowed');
//       // Nueva lógica para permitir owner <-> bidder
//       const allowed =
//         (isOwner &&
//           user.id !== data.targetUserId &&
//           userBids.some(
//             (bid) => bid.user && bid.user.id === data.targetUserId,
//           )) ||
//         (isBidder && data.targetUserId === auction.owner.id);
//       if (!allowed) throw new ForbiddenException('Not allowed');
//       // Join room
//       client.join(data.room);
//       client.emit('joinRoomSuccess', { room: data.room });
//       console.log('[ChatGateway] Usuario unido a la sala:', data.room);
//     } catch (err) {
//       console.error('[ChatGateway] joinRoomError:', err);
//       client.emit('joinRoomError', { message: err.message || 'Unauthorized' });
//     }
//   }

//   @SubscribeMessage('message')
//   async handleMessage(
//     @MessageBody()
//     data: {
//       room: string;
//       sender: string;
//       text: string;
//       auctionId: string;
//       receiverId: string;
//     },
//     @ConnectedSocket() client: Socket,
//   ) {
//     console.log('[ChatGateway] Mensaje recibido:', data);
//     // Guardar mensaje en la base de datos
//     const sender = await this.usersService.findByFirebaseUid(
//       client.handshake.auth?.uid || '',
//     );
//     if (!sender) throw new UnauthorizedException('Sender not found');
//     const auction = await this.auctionsService.findOne(data.auctionId);
//     const receiver = await this.usersService.findOne(data.receiverId);
//     if (!receiver) throw new UnauthorizedException('Receiver not found');
//     await this.chatService.saveMessage({
//       auction,
//       sender,
//       receiver,
//       text: data.text,
//       room: data.room,
//     });
//     this.server.to(data.room).emit('message', data);
//     console.log('[ChatGateway] Mensaje emitido a la sala:', data.room);
//   }

//   @SubscribeMessage('getChatHistory')
//   async handleGetChatHistory(
//     @MessageBody() data: { room: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     console.log('[ChatGateway] getChatHistory para room:', data.room);
//     const messages = await this.chatService.getMessagesByRoom(data.room);
//     // Formatear mensajes para el frontend
//     const formatted = messages.map((msg) => ({
//       sender: msg.sender?.name || 'Unknown',
//       senderId: msg.sender?.id,
//       receiverId: msg.receiver?.id,
//       text: msg.text,
//       createdAt: msg.createdAt,
//     }));
//     client.emit('chatHistory', formatted);
//     console.log('[ChatGateway] chatHistory emitido:', formatted);
//   }
// }

export {}; // Mantiene el archivo como módulo válido para TypeScript
