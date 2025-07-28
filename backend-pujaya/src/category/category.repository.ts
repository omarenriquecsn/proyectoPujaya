import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(category: CreateCategoryDto) {
    const newCategory = await this.categoryRepository.save(category);
    return newCategory;
  }

  async findAll() {
    try {
      const items = await this.categoryRepository.find({
        where: { isActive: true },
        order: { categoryName: 'ASC' },
      });
      return { items };
    } catch (error) {
      throw new BadRequestException('Error fetching categories');
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id, isActive: true },
        relations: ['products'],
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }

      return category;
    } catch (error) {
      throw new BadRequestException(error.message || 'Error fetching category');
    }
  }

  async update(id: string, category: UpdateCategoryDto) {
    try {
      await this.categoryRepository.update(id, category);
      const updatedCategory = await this.categoryRepository.findOne({
        where: { id, isActive: true },
      });

      if (!updatedCategory) {
        throw new BadRequestException('Category not found');
      }

      return updatedCategory;
    } catch (error) {
      throw new BadRequestException(error.message || 'Error updating category');
    }
  }

  async delete(id: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id, isActive: true },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }

      category.isActive = false;
      await this.categoryRepository.save(category);

      return {
        message: `Category with id ${id} was deleted.`,
        category,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error deleting category');
    }
  }
}
