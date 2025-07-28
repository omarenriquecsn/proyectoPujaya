import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/rolesDecorators';
import { UserRole } from 'src/users/types/roles';
import * as admin from 'firebase-admin';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

   
    if (!requireRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: admin.auth.DecodedIdToken | undefined = request.user;

    const hasRequiredRole = requireRoles.includes(user?.role);

    return user !== undefined && hasRequiredRole;
  }
}
