import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { CurrentUserDto } from '../dto/current-user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: CurrentUserDto = request.user;

        if (!user) {
            throw new ForbiddenException('Usuário não autenticado');
        }

        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException('Acesso negado. Permissão insuficiente.');
        }

        return true;
    }
}
