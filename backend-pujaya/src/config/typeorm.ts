import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { User } from 'src/users/entities/user.entity';
import { Auction } from 'src/auctions/entities/auction.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { Bid } from 'src/bids/entities/bid.entity';
import { ChatMessage } from 'src/chat/entities/chat-message.entity';

dotenvConfig({ path: '.env.development' });

// Check if connecting to localhost
const isLocalConnection = process.env.DB_URL === 'localhost';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const config = {
  type: 'postgres',
  host: process.env.DB_URL,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  entities: [User, Auction, Product, Category, Bid, ChatMessage],
  synchronize: false, // Only enable in development
  dropSchema: false, // Never drop schema automatically
  // Disable SSL for local connections
  ssl: isLocalConnection
    ? false
    : {
        rejectUnauthorized: false,
      },
  logging: isDevelopment, // Only log queries in development
};

// console.log('Connection configuration:', {
//   host: config.host,
//   database: config.database,
//   ssl: config.ssl ? 'enabled' : 'disabled',
//   environment: isDevelopment ? 'development' : 'production'
// });

export default registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config as DataSourceOptions);

const initialize = async (): Promise<void> => {
  try {
    await connectionSource.initialize();
    // console.log('Database connected successfully');
  } catch (error) {
    // console.error('Error connecting to database:', error.message);
  }
};

void initialize();
