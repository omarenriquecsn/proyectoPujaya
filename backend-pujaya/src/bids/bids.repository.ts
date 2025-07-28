import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';

@Injectable()
export class BidsRepository {
  constructor(@InjectRepository(Bid) private bidsRepository: Repository<Bid>) {}

  async createBid(bid: Partial<Bid>) {
    const newBid = this.bidsRepository.create(bid);
    return this.bidsRepository.save(newBid);
  }
}
