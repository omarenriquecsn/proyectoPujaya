import { Auction } from '../../auctions/entities/auction.entity';
import { Category } from '../../category/entities/category.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'products',
})
export class Product {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  public name: string;

  @Column({
    type: 'jsonb',
    default: [
      'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/dWxyV6XrakH93wpo/dsc03506-AwvMr4aMPOhZVQkk.jpg',
    ],
  })
  public imgProduct: string[];

  @Column({
    type: 'text',
    nullable: false,
  })
  public description: string;

  @Column('decimal', {
    scale: 2,
    nullable: false,
    precision: 10,
  })
  public initialPrice: number;

  @Column('decimal', {
    scale: 2,
    nullable: false,
    precision: 10,
  })
  public finalPrice: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date | null;

  @OneToOne(() => Auction, (auction) => auction.product)
  auction: Auction;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
