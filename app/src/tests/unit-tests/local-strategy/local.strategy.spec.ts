import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../modules/auth/auth.service';
import { LocalStrategy } from '../../../local.strategy/local.strategy';

describe('LocalStrategy', () => {
    let localStrategy: LocalStrategy;
    let authService: AuthService;

    const mockAuthService = {
        validateUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LocalStrategy,
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();

        localStrategy = module.get<LocalStrategy>(LocalStrategy);
        authService = module.get<AuthService>(AuthService);
    });

    describe('validate', () => {
        it('should return a user if credentials are valid', async () => {
            const email = 'test@example.com';
            const password = 'password';
            const user = { id: 1, email };

            mockAuthService.validateUser.mockResolvedValue(user);

            const result = await localStrategy.validate(email, password);

            expect(result).toEqual(user);
            expect(mockAuthService.validateUser).toHaveBeenCalledWith(email, password);
        });

        it('should throw UnauthorizedException if credentials are invalid', async () => {
            const email = 'test@example.com';
            const password = 'wrongpassword';

            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(localStrategy.validate(email, password)).rejects.toThrow(UnauthorizedException);
        });
    });
});