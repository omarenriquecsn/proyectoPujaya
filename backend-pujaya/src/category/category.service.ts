import { Injectable } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(category: CreateCategoryDto) {
    return await this.categoryRepository.create(category);
  }

  async findAll() {
    return await this.categoryRepository.findAll();
  }

  async findOne(id: string) {
    return await this.categoryRepository.findOne(id);
  }

  async update(id: string, category: UpdateCategoryDto) {
    return await this.categoryRepository.update(id, category);
  }

  async delete(id: string) {
    return await this.categoryRepository.delete(id);
  }
}