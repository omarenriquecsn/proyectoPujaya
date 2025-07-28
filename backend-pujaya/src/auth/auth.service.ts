import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from '../emailService/emailService.service';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
  ) {}

  async signUp(createUser: CreateUserDto) {
    const email = createUser.email;
    const newUser = await this.userRepository.findOneBy({ email });

    if (newUser) {
      throw new BadRequestException('User already exists');
    }

    const user = this.userRepository.create(createUser);
    await this.userRepository.save(user);

    // Envía el email de bienvenida
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return user;
  }

  async getCurrentUser(firebaseUid: string) {
    // console.log('Getting user with firebaseUid:', firebaseUid);

    const user = await this.userRepository.findOne({
      where: { firebaseUid },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'address',
        'role',
        'imgProfile',
        'country',
      ],
    });

    if (!user) {
      // console.log('User not found with firebaseUid:', firebaseUid);
      throw new NotFoundException('User not found');
    }

    // console.log('Found user:', {
    //   id: user.id,
    //   email: user.email,
    //   role: user.role
    // });

    return user;
  }

  async validateFirebaseUser(decodedToken: admin.auth.DecodedIdToken) {
    console.log('Validating Firebase user:', decodedToken.uid);

    const user = await this.userRepository.findOne({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      console.log(
        'User not found in database for Firebase UID:',
        decodedToken.uid,
      );
      throw new NotFoundException('User not found in database');
    }

    console.log('User validated successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return user;
  }
}
