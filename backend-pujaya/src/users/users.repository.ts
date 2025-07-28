import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, LessThan } from 'typeorm';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import { UserRole } from './types/roles';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    try {
      return await this.repository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error crating user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error searching for user');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.repository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User with id ${id} not found`);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error searching for user');
    }
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    try {
      await this.repository.update(id, user);
      const updatedUser = await this.repository.findOneBy({ id });
      if (!updatedUser)
        throw new NotFoundException(`Error updating user with id ${id}`);
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.repository.findOneBy({ id });
      if (!user)
        throw new NotFoundException(`Error deleting user with id ${id}`);
      await this.repository.update(id, {
        isActive: false,
        deactivatedAt: new Date(),
      });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async deletePermanently(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user permanently');
    }
  }

  async fileUpload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'users' },
        (error, result) => {
          if (error) return reject(error);
          if (!result || !result.secure_url) {
            return reject(
              new InternalServerErrorException(
                'No se pudo obtener la URL de Cloudinary',
              ),
            );
          }
          resolve(result.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      const user = await this.repository.findOneBy({ firebaseUid });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error searching for user by Firebase UID',
      );
    }
  }

  async findPremiumExpired(now: Date): Promise<User[]> {
    return this.repository.find({
      where: {
        role: UserRole.PREMIUM,
        subscriptionEndDate: LessThan(now),
        subscriptionStatus: 'active',
      },
    });
  }
}
