import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

function matchRoles(roles, userRoles) {
  for (let role of userRoles) {
    if (roles.includes(role)) {
      return true;
    }
  }
  return false;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }
    const req = context.switchToHttp().getRequest() as any;
    const user = req.user;

    return matchRoles(roles, user.role);
  }
}
