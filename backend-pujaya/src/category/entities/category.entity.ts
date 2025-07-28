import { Product } from '../../products/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  categoryName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product: Product) => product.category)
  products: Product[];
}
