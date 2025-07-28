import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { categoriesSeed } from './category.seeds';

@Injectable()
export class CategorySeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.categoryRepository.count();
    if (count > 0) {
      Logger.log('Categories already exist, skipping seeder');
      return;
    }

    Logger.log('Running categories seeder...');
    
    for (const category of categoriesSeed) {
      const newCategory = this.categoryRepository.create(category);
      await this.categoryRepository.save(newCategory);
    }
    
    Logger.log('Categories seeder completed successfully');
  }
} 