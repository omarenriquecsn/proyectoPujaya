import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { User } from '../users/entities/user.entity';
import { Auction } from '../auctions/entities/auction.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepository: Repository<ChatMessage>,
    private readonly dataSource: DataSource, // <-- necesario para consultas avanzadas
  ) {}

  async saveMessage({
    auction,
    sender,
    receiver,
    text,
    room,
  }: {
    auction: Auction;
    sender: User;
    receiver: User;
    text: string;
    room: string;
  }) {
    const message = this.chatRepository.create({
      auction,
      sender,
      receiver,
      text,
      room,
    });
    return this.chatRepository.save(message);
  }

  async getMessagesByRoom(room: string) {
    return this.chatRepository.find({
      where: { room },
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  /**
   * Obtiene todas las conversaciones del owner agrupadas por subasta y pujador,
   * mostrando el último mensaje de cada conversación.
   * @param ownerId ID del usuario owner
   */
  async getOwnerConversations(ownerId: string) {
    // Agrupa solo por subasta y pujador, muestra el último mensaje de cada conversación
    return this.chatRepository
      .createQueryBuilder('msg')
      .innerJoin('msg.auction', 'auction')
      .innerJoin('auction.owner', 'owner')
      .innerJoin('msg.sender', 'sender')
      .where('owner.id = :ownerId', { ownerId })
      .andWhere('sender.id != :ownerId', { ownerId })
      .select([
        'auction.id AS auction_id',
        'auction.name AS auction_name',
        'sender.id AS bidder_id',
        'sender.name AS bidder_name',
        'msg.room AS room',
        'MAX(msg.createdAt) AS lastMessageAt',
        'MAX(msg.text) AS lastMessageText',
      ])
      .groupBy('auction.id')
      .addGroupBy('sender.id')
      .addGroupBy('msg.room')
      .addGroupBy('auction.name')
      .addGroupBy('sender.name')
      .orderBy('MAX(msg.createdAt)', 'DESC')
      .getRawMany();
  }

  /**
   * Obtiene todas las conversaciones donde el usuario participa (como sender o receiver),
   * agrupadas por subasta y otro usuario, mostrando el último mensaje de cada conversación.
   * @param userId ID del usuario
   */
  async getUserConversations(userId: string) {
    // Agrupa por subasta y el otro usuario (distinto al actual)
    return this.chatRepository
      .createQueryBuilder('msg')
      .innerJoin('msg.auction', 'auction')
      .innerJoin('msg.sender', 'sender')
      .innerJoin('msg.receiver', 'receiver')
      .where('sender.id = :userId OR receiver.id = :userId', { userId })
      .andWhere('sender.id != receiver.id')
      .select([
        'auction.id AS auction_id',
        'auction.name AS auction_name',
        `CASE WHEN sender.id = :userId THEN receiver.id ELSE sender.id END AS other_user_id`,
        `CASE WHEN sender.id = :userId THEN receiver.name ELSE sender.name END AS other_user_name`,
        'msg.room AS room',
        'MAX(msg.createdAt) AS lastMessageAt',
        'MAX(msg.text) AS lastMessageText',
      ])
      .setParameter('userId', userId)
      .groupBy('auction.id')
      .addGroupBy('msg.room')
      .addGroupBy('auction.name')
      .addGroupBy('other_user_id')
      .addGroupBy('other_user_name')
      .orderBy('MAX(msg.createdAt)', 'DESC')
      .getRawMany();
  }
}
