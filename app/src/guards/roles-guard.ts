import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles || roles.length === 0) {
            return true;
        };

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('Неавторизованный пользователь!');
        };

        if (!this.matchRoles(roles, user.roles)) {
            throw new ForbiddenException('У вас нет доступа к этому ресурсу!');
        };

        return true;
    };

    matchRoles(roles: string[], userRoles: string[]): boolean {
        return roles.some(role => userRoles.includes(role));
    };
};