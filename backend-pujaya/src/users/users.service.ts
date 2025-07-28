import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { EmailService } from '../emailService/emailService.service';
import * as admin from 'firebase-admin';
import { UserRole } from './types/roles';

const DEFAULT_PROFILE_IMG =
  'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg';

@Injectable()
export class UsersService {
  private auth: admin.auth.Auth;
  constructor(
    private usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
  ) {
    this.auth = firebaseAdmin.auth();
  }

  async create(
    createUserDto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    let imgProfileUrl: string | null = null;
    if (file) {
      const newUrl = await this.usersRepository.fileUpload(file);
      if (!newUrl) {
        throw new BadRequestException(
          'No fue posible cargar la imagen de perfil',
        );
      }
      imgProfileUrl = newUrl;
    }
    const user = new User();
    Object.assign(user, createUserDto);
    user.imgProfile = imgProfileUrl ?? DEFAULT_PROFILE_IMG;
    // Puedes inicializar otros campos por defecto si es necesario
    return this.usersRepository.create(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    return await this.usersRepository.findOne(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Obtén el usuario antes de actualizar
    const userBefore = await this.usersRepository.findOne(id);

    // Actualiza el usuario
    const updatedUser = await this.usersRepository.update(id, updateUserDto);

    // Envía el email de notificación con los campos actualizados
    await this.emailService.sendUpdateNotification(
      updatedUser.email,
      updatedUser.name,
      updateUserDto, // Esto contiene solo los campos que se actualizaron
    );

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id);

    await this.usersRepository.remove(id);

    await this.emailService.sendAccountDeactivation(user.email, user.name);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeInactiveUsers() {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const users = await this.usersRepository.findAll();
    const toDelete = users.filter(
      (user) =>
        !user.isActive &&
        user.deactivatedAt &&
        now.getTime() - new Date(user.deactivatedAt).getTime() > THIRTY_DAYS,
    );
    for (const user of toDelete) {
      await this.usersRepository.deletePermanently(user.id);
    }
    if (toDelete.length > 0) {
      // console.log(`Users deleted permanently: ${toDelete.length}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async downgradeExpiredPremiumUsers() {
    const now = new Date();
    const users = await this.usersRepository.findAll();
    for (const user of users) {
      if (
        user.role === UserRole.PREMIUM &&
        user.subscriptionEndDate &&
        user.subscriptionEndDate < now
      ) {
        await this.usersRepository.update(user.id, {
          role: UserRole.REGULAR,
          subscriptionStatus: null,
          subscriptionEndDate: null,
          stripeSubscriptionId: null,
        });
        // Opcional: notificar al usuario por email
        // await this.emailService.sendUpdateNotification(user.email, user.name, { role: UserRole.REGULAR });
      }
    }
  }

  // Funcion para cambiar role
  async setUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      // Cambia el rol en Firebase
      await this.auth.setCustomUserClaims(uid, { role });

      // Cambia el rol en la base de datos
      const user = await this.usersRepository.findByFirebaseUid(uid);
      if (user) {
        await this.usersRepository.update(user.id, { role });
      }
      // console.log(`Rol changed in Firebase and DB for UID: ${uid}`);
    } catch (error) {
      // console.error('Error changing the role');
      throw new Error('We cannot change the role');
    }
  }

  // funcion para bucar usuarios en firebase
  async getUserByIdFirebase(uid: string) {
    try {
      // console.log('Attempting to get Firebase user with UID:', uid); //
      const userRecord = await this.auth.getUser(uid);
      // console.log('Successfully found Firebase user:', userRecord.uid);
      return userRecord;
    } catch (error) {
      // console.error('Error: User not foud', error.message);
      throw error;
    }
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.usersRepository.findByFirebaseUid(firebaseUid);
  }

  async uploadProfileImage(file: Express.Multer.File, id: string) {
    const user = await this.usersRepository.findOne(id);
    console.log('user', user);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const newUrl = await this.usersRepository.fileUpload(file);
    if (!newUrl) {
      throw new BadRequestException('Could not upload the profile image');
    }
    await this.usersRepository.update(id, { imgProfile: newUrl });
    console.log('newUrl', newUrl);
    return newUrl;
  }

  async findPremiumExpired(now: Date): Promise<User[]> {
    return this.usersRepository.findPremiumExpired(now);
  }
}
