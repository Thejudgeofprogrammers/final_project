import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { RoleGuard } from '../../../guards/roles-guard';
import { Reflector } from '@nestjs/core';

describe('RoleGuard', () => {
    let roleGuard: RoleGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RoleGuard, Reflector],
        }).compile();

        roleGuard = module.get<RoleGuard>(RoleGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    describe('canActivate', () => {
        it('should allow access if no roles are defined', () => {
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({ user: {} }),
                }),
                getHandler: () => ({}),
            } as ExecutionContext;

            jest.spyOn(reflector, 'get').mockReturnValue(undefined);

            expect(roleGuard.canActivate(context)).toBe(true);
        });

        it('should throw UnauthorizedException if user is not authenticated', () => {
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({ user: null }),
                }),
                getHandler: () => ({}),
            } as ExecutionContext;

            jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

            expect(() => roleGuard.canActivate(context)).toThrow(UnauthorizedException);
        });

        it('should throw ForbiddenException if user does not have the required role', () => {
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({ user: { roles: ['user'] } }),
                }),
                getHandler: () => ({}),
            } as ExecutionContext;

            jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

            expect(() => roleGuard.canActivate(context)).toThrow(ForbiddenException);
        });

        it('should allow access if user has the required role', () => {
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({ user: { roles: ['admin'] } }),
                }),
                getHandler: () => ({}),
            } as ExecutionContext;

            jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

            expect(roleGuard.canActivate(context)).toBe(true);
        });

        it('should allow access if user has multiple roles and one matches', () => {
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({ user: { roles: ['admin', 'user'] } }),
                }),
                getHandler: () => ({}),
            } as ExecutionContext;

            jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

            expect(roleGuard.canActivate(context)).toBe(true);
        });
    });
});
