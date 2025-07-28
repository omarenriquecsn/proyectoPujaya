import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { auth } from 'firebase-admin';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject('FIREBASE_AUTH') private firebaseAuth: auth.Auth,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('There is not a token of authentication');
    }
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Format');
    }
    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(token);

      // Busca el usuario en la base de datos por firebaseUid
      const user = await this.usersService.findByFirebaseUid(decodedToken.uid);
      if (!user) {
        throw new UnauthorizedException('User not found in DB');
      }

      request.user = user; // Aquí sí es el usuario de la DB

      return true;
    } catch (error) {
      // console.error('Error: the token verification failed', error.message);
      throw new UnauthorizedException('Authentication token invalid');
    }
  }
}
