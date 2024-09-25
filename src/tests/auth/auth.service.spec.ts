import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../modules/auth/auth.service';
import { UsersService } from '../../modules/users/users.service';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;
    const bcrypt = require('bcryptjs');

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            AuthService,
            {
                provide: UsersService,
                useValue: {
                    findByEmail: jest.fn(),
                },
            },
        ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return user data when credentials are valid', async () => {
        const mockUser = {
            email: 'test@example.com',
            passwordHash: 'hashedpassword',
            contactPhone: '+798169342341',
            name: 'Test User',
            role: 'client',
        };

        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        const result = await authService.validateUser('test@example.com', 'password');

        expect(result).toEqual({
            email: 'test@example.com',
            name: 'Test User',
            role: 'client',
            contactPhone: '+798169342341',
            passwordHash: 'hashedpassword'
        });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

        await expect(
            authService.validateUser('nonexistent@example.com', 'password'),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
        const mockUser = {
            email: 'test@example.com',
            passwordHash: 'hashedpassword',
            contactPhone: '+798169342341',
            name: 'Test User',
            role: 'client',
        };

        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            authService.validateUser('test@example.com', 'wrongpassword'),
        ).rejects.toThrow(UnauthorizedException);
    });
});
