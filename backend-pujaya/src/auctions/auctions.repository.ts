import { BadRequestException, Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { Product } from 'src/products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { User } from 'src/users/entities/user.entity';
import { EmailService } from 'src/emailService/emailService.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuctionsRepository {
  constructor(
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async createAuction(
    createAuctionDto: CreateAuctionDto,
    user: User,
  ): Promise<Auction> {
    if (!user || !user.id) {
      throw new BadRequestException(
        'User (owner) is required to create an auction',
      );
    }

    const newAuction = this.auctionsRepository.create({
      name: createAuctionDto.name,
      description: createAuctionDto.description,
      endDate: new Date(createAuctionDto.endDate),
      owner: user,
      latitude: createAuctionDto.latitude,
      longitude: createAuctionDto.longitude,
    });

    await this.auctionsRepository.save(newAuction);

    // Si se proporciona un ID de producto, lo asociamos a la subasta
    if (createAuctionDto.productId) {
      const product = await this.productsRepository.findOneBy({
        id: createAuctionDto.productId,
      });

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      product.auction = newAuction;
      await this.productsRepository.save(product);

      // Actualizamos la subasta con el producto
      newAuction.product = product;
      await this.auctionsRepository.save(newAuction);
    }

    await this.emailService.sendAuctionCreatedEmail(
      user.email,
      newAuction.name,
      user.name,
      newAuction.product?.initialPrice || 0,
      newAuction.endDate,
    );

    return this.findOne(newAuction.id);
  }

  async findAll(
    limit: number,
    page: number,
    search?: string,
    category?: string,
    sort?: string,
    sellerId?: string,
    lat?: number,
    lng?: number,
    radius: number = 10,
  ): Promise<{ auctions: Auction[]; total: number }> {
    const query = this.auctionsRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.owner', 'owner')
      .leftJoinAndSelect('auction.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('auction.bids', 'bids')
      .where('auction.isActive = :active', { active: true });

    // Búsqueda por nombre o descripción de la subasta o producto
    if (search) {
      query.andWhere(
        '(LOWER(auction.name) LIKE :search OR LOWER(auction.description) LIKE :search OR LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    // Filtro por categoría (usando el nombre de la categoría, no el id)
    if (category) {
      query.andWhere('LOWER(category.categoryName) = :category', {
        category: category.toLowerCase(),
      });
    }

    // Filtro por vendedor (sellerId)
    if (sellerId) {
      query.andWhere('owner.id = :sellerId', { sellerId });
    }

    // Location filter (Haversine formula)
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      // 6371 = Earth radius in km
      query.andWhere(
        `
        (auction.latitude IS NOT NULL AND auction.longitude IS NOT NULL AND
          6371 * 2 * ASIN(SQRT(
            POWER(SIN((:lat - auction.latitude) * PI() / 180 / 2), 2) +
            COS(:lat * PI() / 180) * COS(auction.latitude * PI() / 180) *
            POWER(SIN((:lng - auction.longitude) * PI() / 180 / 2), 2)
          )) <= :radius
        )
      `,
        { lat, lng, radius },
      );
    }

    // Ordenamiento
    if (sort === 'ending') {
      query.orderBy('auction.endDate', 'ASC');
    } else if (sort === 'newest') {
      query.orderBy('auction.createdAt', 'DESC');
    } else if (sort === 'lowest') {
      query.orderBy('product.initialPrice', 'ASC');
    } else if (sort === 'highest') {
      query.orderBy('product.initialPrice', 'DESC');
    } else {
      query.orderBy('auction.createdAt', 'DESC');
    }

    query.skip((page - 1) * limit).take(limit);

    const [auctions, total] = await query.getManyAndCount();

    // Calcular el currentHighestBid para cada subasta
    auctions.forEach((auction) => {
      if (auction.bids && auction.bids.length > 0) {
        const highestBid = Math.max(
          ...auction.bids.map((b) => Number(b.amount)),
        );
        auction.currentHighestBid = highestBid;
      } else if (auction.product && auction.product.initialPrice) {
        auction.currentHighestBid = Number(auction.product.initialPrice);
      } else {
        auction.currentHighestBid = 0;
      }
    });

    return { auctions, total };
  }

  async findOne(id: string): Promise<Auction> {
    const auction = await this.auctionsRepository.findOne({
      where: { id },
      relations: ['owner', 'product', 'product.category', 'bids'],
    });

    if (!auction) {
      throw new BadRequestException('No auction found with the provided ID');
    }

    // Calcular el currentHighestBid (precio actual de la subasta)
    if (auction.bids && auction.bids.length > 0) {
      // Buscar la puja más alta
      const highestBid = Math.max(...auction.bids.map((b) => Number(b.amount)));
      auction.currentHighestBid = highestBid;
    } else if (auction.product && auction.product.initialPrice) {
      auction.currentHighestBid = Number(auction.product.initialPrice);
    } else {
      auction.currentHighestBid = 0;
    }

    return auction;
  }

  async updateAuction(id: string, updateAuctionDto: UpdateAuctionDto) {
    const auction = await this.findOne(id);

    if (!auction) {
      throw new BadRequestException('Auction not found');
    }

    if (!auction.canBeModified()) {
      throw new BadRequestException(
        'Cannot modify auction: it is either finished, inactive, or has active bids',
      );
    }

    // Actualizamos los campos básicos
    Object.assign(auction, updateAuctionDto);

    if (updateAuctionDto.endDate) {
      auction.endDate = new Date(updateAuctionDto.endDate);
    }

    await this.auctionsRepository.save(auction);
    return this.findOne(id);
  }

  async addProductToAuction(
    auctionId: string,
    productId: string,
  ): Promise<Auction> {
    const auction = await this.findOne(auctionId);

    if (!auction.canBeModified()) {
      throw new BadRequestException(
        'Cannot modify auction: it is either finished, inactive, or has active bids',
      );
    }

    const product = await this.productsRepository.findOneBy({ id: productId });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (auction.product) {
      throw new BadRequestException('Auction already has a product assigned');
    }

    product.auction = auction;
    await this.productsRepository.save(product);

    auction.product = product;
    await this.auctionsRepository.save(auction);

    return this.findOne(auctionId);
  }

  async deleteAuction(id: string) {
    const auction = await this.findOne(id);

    if (!auction) {
      throw new BadRequestException('Auction not found');
    }

    if (auction.hasBids()) {
      throw new BadRequestException('Cannot delete auction with active bids');
    }

    // Si la subasta tiene producto asociado
    if (auction.product && auction.product.id) {
      // 1. Marcar ambos como inactivos y guardar
      auction.isActive = false;
      auction.deactivatedAt = new Date();
      auction.product.isActive = false;
      auction.product.deactivatedAt = new Date();
      await this.productsRepository.save(auction.product);
      await this.auctionsRepository.save(auction);
      // 2. Desvincular el producto de la subasta (pero NO eliminarlo)
      await this.auctionsRepository
        .createQueryBuilder()
        .update(Auction)
        .set({ product: null })
        .where({ id: auction.id })
        .execute();
    } else {
      // Si no hay producto, igual marcar la subasta como inactiva
      auction.isActive = false;
      auction.deactivatedAt = new Date();
      await this.auctionsRepository.save(auction);
    }

    return `Auction with ID: ${id} is now inactive and its product (if any) is also inactive.`;
  }

  async findAuctionsToDelete(dateLimit: Date): Promise<Auction[]> {
    return this.auctionsRepository.find({
      where: {
        isActive: false,
        deactivatedAt: LessThan(dateLimit),
      },
    });
  }

  async deleteAuctionById(id: string) {
    return this.auctionsRepository.delete(id);
  }

  async deleteAuctionByIdForAdmin(id: string) {
    const auction = await this.findOne(id);
    auction.isActive = !auction.isActive;
    auction.deactivatedAt = auction.isActive ? null : new Date();
    await this.auctionsRepository.save(auction);
  }

  // Método para buscar subastas activas cuyo endDate ya pasó
  async findExpiredActiveAuctions(now: Date): Promise<Auction[]> {
    return this.auctionsRepository.find({
      where: {
        isActive: true,
        endDate: LessThan(now),
      },
    });
  }

  // Método para guardar una subasta
  async saveAuction(auction: Auction) {
    return this.auctionsRepository.save(auction);
  }

  async findByUserAndStatus(userId: string, status?: string) {
    const query = this.auctionsRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.owner', 'owner')
      .leftJoinAndSelect('auction.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('auction.bids', 'bids');

    if (status === 'active') {
      // Subastas activas donde el usuario ha hecho al menos una bid
      query
        .where('auction.isActive = true')
        .andWhere('auction.endDate > NOW()')
        .andWhere('bids.bidderId = :userId', { userId });
    } else if (status === 'won') {
      // Aquí deberías poner la lógica para subastas ganadas por el usuario
    } else if (status === 'selling') {
      // Subastas creadas por el usuario
      query.where('owner.id = :userId', { userId });
    } else if (status === 'favorites') {
      // Si tienes favoritos, deberías hacer join con la tabla de favoritos
    } else if (status === 'history') {
      // Subastas finalizadas donde el usuario hizo bid
      query
        .where('auction.endDate <= NOW()')
        .andWhere('bids.userId = :userId', { userId });
    }

    const auctions = await query.getMany();
    return auctions;
  }

  // Permite usar QueryBuilder desde fuera
  createQueryBuilder(alias: string) {
    return this.auctionsRepository.createQueryBuilder(alias);
  }
}
