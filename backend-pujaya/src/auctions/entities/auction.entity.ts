import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { Bid } from '../../bids/entities/bid.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({
  name: 'auctions',
})
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  public name: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  public description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @ManyToOne(() => User, (user) => user.auctions)
  owner: User;

  @OneToOne(() => Product, (product) => product.auction, { nullable: true })
  @JoinColumn()
  product: Product | null;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentHighestBid: number;

  @Column({ type: 'uuid', nullable: true })
  currentHighestBidderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  // Helper method to check if auction has any bids
  hasBids(): boolean {
    return this.bids && this.bids.length > 0;
  }

  // Helper method to check if auction can be modified
  canBeModified(): boolean {
    const now = new Date();
    return this.isActive && now < this.endDate && !this.hasBids();
  }
}
