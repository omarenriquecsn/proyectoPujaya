import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Auction } from '../auctions/entities/auction.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Bid } from '../bids/entities/bid.entity';
import { ChatMessage } from '../chat/entities/chat-message.entity';

dotenvConfig({ path: '.env.development' });

// Verificar si estamos conectando a localhost
const isLocalConnection = process.env.DB_URL === 'localhost';

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_URL,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Auction, Product, Category, Bid, ChatMessage],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl: isLocalConnection
    ? false
    : {
        rejectUnauthorized: false,
      },
  logging: true,
};

export const AppDataSource = new DataSource(config);
