import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionsRepository } from './auctions.repository';
import { EmailService } from '../emailService/emailService.service';
import { User } from '../users/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AuctionsService {
  constructor(
    private auctionsRepository: AuctionsRepository,
    private readonly emailService: EmailService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createAuctionDto: CreateAuctionDto, user: User) {
    // Validar que la fecha de finalización sea futura
    const endDate = new Date(createAuctionDto.endDate);
    if (endDate <= new Date()) {
      throw new BadRequestException('End date must be in the future');
    }

    return this.auctionsRepository.createAuction(createAuctionDto, user);
  }

  async findAll(
    limit: number = 10,
    page: number = 1,
    search?: string,
    category?: string,
    sort?: string,
    sellerId?: string,
    lat?: number,
    lng?: number,
    radius: number = 10,
  ) {
    return this.auctionsRepository.findAll(
      limit,
      page,
      search,
      category,
      sort,
      sellerId,
      lat,
      lng,
      radius,
    );
  }

  async findOne(id: string) {
    return this.auctionsRepository.findOne(id);
  }

  async update(id: string, updateAuctionDto: UpdateAuctionDto, user: User) {
    const auction = await this.auctionsRepository.findOne(id);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('Only the creator can update the auction');
    }

    if (new Date() > auction.endDate) {
      throw new BadRequestException('Cannot update a finished auction');
    }

    if (updateAuctionDto.endDate) {
      const newEndDate = new Date(updateAuctionDto.endDate);
      if (newEndDate <= new Date()) {
        throw new BadRequestException('End date must be in the future');
      }
    }

    const updatedAuction = await this.auctionsRepository.updateAuction(
      id,
      updateAuctionDto,
    );

    // Notificar al owner
    await this.emailService.sendAuctionUpdatedNotification(
      auction.owner.email,
      auction.owner.name,
      auction.name,
    );

    return updatedAuction;
  }

  async addProduct(auctionId: string, productId: string, user: User) {
    const auction = await this.auctionsRepository.findOne(auctionId);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException(
        'Only the creator can add products to the auction',
      );
    }

    if (new Date() > auction.endDate) {
      throw new BadRequestException(
        'Cannot add products to a finished auction',
      );
    }

    return this.auctionsRepository.addProductToAuction(auctionId, productId);
  }

  async remove(id: string, user: User) {
    const auction = await this.auctionsRepository.findOne(id);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('Only the creator can delete the auction');
    }

    if (new Date() > auction.endDate) {
      throw new BadRequestException('Cannot delete a finished auction');
    }

    const result = await this.auctionsRepository.deleteAuction(id);

    // Notificar al owner
    await this.emailService.sendAuctionDeletedNotification(
      auction.owner.email,
      auction.owner.name,
      auction.name,
    );

    return result;
  }

  async endAuction(id: string, user: User) {
    const auction = await this.auctionsRepository.findOne(id);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    if (auction.owner.id !== user.id) {
      throw new ForbiddenException('Only the creator can end the auction');
    }
    if (!auction.isActive) {
      throw new BadRequestException('Auction is already finished');
    }
    auction.isActive = false;
    auction.endDate = new Date();
    await this.auctionsRepository.saveAuction(auction);

    await this.emailService.sendAuctionUpdatedNotification(
      auction.owner.email,
      auction.owner.name,
      auction.name,
    );
    return { message: 'Auction ended successfully', auctionId: auction.id };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldAuctions() {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const dateLimit = new Date(Date.now() - ONE_DAY);

    const auctionsToDelete =
      await this.auctionsRepository.findAuctionsToDelete(dateLimit);

    for (const auction of auctionsToDelete) {
      // Si la subasta tiene producto asociado inactivo y con deactivatedAt > 1 día, eliminar producto
      if (
        auction.product &&
        !auction.product.isActive &&
        auction.product.deactivatedAt &&
        auction.product.deactivatedAt < dateLimit
      ) {
        await this.productsService.remove(auction.product.id);
      }
      await this.auctionsRepository.deleteAuctionById(auction.id);
    }
  }

  async removeForAdmin(id: string) {
    return this.auctionsRepository.deleteAuctionByIdForAdmin(id);
  }

  async findByUserAndStatus(userId: string, status?: string) {
    // Debes implementar la lógica real según tu modelo de datos
    // Ejemplo básico:
    return this.auctionsRepository.findByUserAndStatus(userId, status);
  }

  // Cron que desactiva subastas cuyo endDate ya pasó
  @Cron(CronExpression.EVERY_HOUR)
  async deactivateExpiredAuctions() {
    const now = new Date();
    // Buscar todas las subastas activas cuyo endDate ya pasó
    const expiredAuctions =
      await this.auctionsRepository.findExpiredActiveAuctions(now);
    for (const auction of expiredAuctions) {
      auction.isActive = false;
      auction.deactivatedAt = now;
      await this.auctionsRepository.saveAuction(auction);
      // Notificar al owner
      if (auction.owner?.email && auction.owner?.name) {
        await this.emailService.sendAuctionEndedNotification(
          auction.owner.email,
          auction.owner.name,
          auction.name,
        );
      }
      // Notificar a todos los usuarios que pujaron
      if (auction.bids && auction.bids.length > 0) {
        const notifiedUsers = new Set();
        for (const bid of auction.bids) {
          if (
            bid.bidder?.email &&
            bid.bidder?.name &&
            !notifiedUsers.has(bid.bidder.email)
          ) {
            await this.emailService.sendAuctionEndedNotification(
              bid.bidder.email,
              bid.bidder.name,
              auction.name,
            );
            notifiedUsers.add(bid.bidder.email);
          }
        }
      }
    }
    if (expiredAuctions.length > 0) {
      console.log(
        `Se desactivaron ${expiredAuctions.length} subastas expiradas automáticamente y se notificó a los usuarios.`,
      );
    }
  }
}
