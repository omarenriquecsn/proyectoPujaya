import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';
import { Auction } from '../auctions/entities/auction.entity';
import { User } from '../users/entities/user.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { AuctionsRepository } from '../auctions/auctions.repository';
import { EmailService } from '../emailService/emailService.service';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid) private bidsRepository: Repository<Bid>,
    private readonly auctionsRepository: AuctionsRepository,
    private readonly emailService: EmailService,
  ) {}

  async createBid(createBidDto: CreateBidDto, user: User) {
    const { auctionId, amount } = createBidDto;
    const auction = await this.auctionsRepository.findOne(auctionId);
    if (!auction) throw new BadRequestException('Auction not found');
    if (!auction.isActive)
      throw new BadRequestException('Auction is not active');
    if (auction.owner.id === user.id)
      throw new ForbiddenException('You cannot bid on your own auction');
    const highestBid = auction.bids?.length
      ? Math.max(...auction.bids.map((b) => b.amount))
      : (auction.product?.initialPrice ?? 0);
    if (Number(amount) <= Number(highestBid))
      throw new BadRequestException(
        'Bid must be higher than current highest bid',
      );
    // Forzar amount a entero
    const intAmount = Math.floor(Number(amount));
    const bid = this.bidsRepository.create({
      amount: intAmount,
      bidder: user,
      auction,
    });
    await this.bidsRepository.save(bid);
    // Notificar al creador de la subasta
    await this.emailService.sendBidNotification(
      auction.owner.email,
      auction.owner.name,
      auction.name,
      user.name,
      intAmount,
    );
    return bid;
  }

  async getBidsByAuction(auctionId: string) {
    if (!auctionId) throw new BadRequestException('auctionId is required');
    const bids = await this.bidsRepository.find({
      where: { auction: { id: auctionId } },
      relations: ['bidder'],
      order: { amount: 'DESC', createdAt: 'DESC' },
    });
    return bids.map((bid) => ({
      id: bid.id,
      amount: Math.floor(Number(bid.amount)),
      createdAt: bid.createdAt,
      user: bid.bidder ? { id: bid.bidder.id, name: bid.bidder.name } : null,
    }));
  }

  async getBidsByUser(userId: string, onlyActive = false) {
    if (!userId) throw new BadRequestException('userId is required');
    const bids = await this.bidsRepository.find({
      where: { bidder: { id: userId } },
      relations: ['auction', 'auction.product', 'auction.owner'],
      order: { createdAt: 'DESC' },
    });
    // Agrupar por subasta y quedarse con la puja más alta del usuario en cada una
    const auctionsMap = new Map();
    for (const bid of bids) {
      // Recargar la subasta para asegurar currentHighestBid actualizado
      const auction = await this.auctionsRepository.findOne(bid.auction.id);
      if (!auction) continue;
      // Si solo queremos activas, filtrar aquí
      if (
        onlyActive &&
        (!auction.isActive || new Date(auction.endDate) <= new Date())
      )
        continue;
      const auctionId = auction.id;
      if (
        !auctionsMap.has(auctionId) ||
        bid.amount > auctionsMap.get(auctionId).myBid
      ) {
        // Calcular el currentHighestBid igual que en findOne
        let currentHighestBid = 0;
        if (auction.bids && auction.bids.length > 0) {
          currentHighestBid = Math.max(
            ...auction.bids.map((b) => Number(b.amount)),
          );
        } else if (auction.product && auction.product.initialPrice) {
          currentHighestBid = Number(auction.product.initialPrice);
        }
        auctionsMap.set(auctionId, {
          auctionId: auction.id,
          title: auction.name,
          category: auction.product?.category?.categoryName || '',
          image: auction.product?.imgProduct?.[0] || '',
          myBid: Math.floor(Number(bid.amount)),
          currentBid: Math.floor(Number(currentHighestBid)),
          timeLeft: auction.endDate ? this.getTimeLeft(auction.endDate) : '',
        });
      }
    }
    return Array.from(auctionsMap.values());
  }

  // Helper para calcular el tiempo restante en formato "2h 15m"
  private getTimeLeft(endDate: Date): string {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ended';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}
