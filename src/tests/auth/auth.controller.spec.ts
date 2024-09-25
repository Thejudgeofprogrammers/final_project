import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../modules/auth/auth.controller';
import { UsersService } from '../../modules/users/users.service'
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
    let authController: AuthController;

    const mockUsersService = {
        createUser: jest.fn(),
        findByEmail: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
    });

    describe('login', () => {
        it('should return user data if login is successful', async () => {
            const req = {
                user: {
                    email: 'test@example.com',
                    name: 'Test User',
                    contactPhone: '+798169342341',
                    role: 'client',
                },
                login: jest.fn((user, callback) => callback(null)),
                session: {},
            } as unknown as Request;

            const result = await authController.login(req);

            expect(result).toEqual({
                email: 'test@example.com',
                name: 'Test User',
                contactPhone: '+798169342341',
            });
        });

        it('should throw UnauthorizedException if login fails', async () => {
            const req = {
                user: {},
                login: jest.fn((user, callback) => callback(new Error('Login failed'))),
                session: {},
            } as unknown as Request;

            await expect(authController.login(req)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('should clear cookie and send response on successful logout', async () => {
            const req = {
                logout: jest.fn((callback) => callback(null)),
            } as unknown as Request;
            const res = {
                clearCookie: jest.fn(),
                status: jest.fn(() => res),
                send: jest.fn(),
            } as unknown as Response;

            await authController.logout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalled();
        });

        it('should return 500 if logout fails', async () => {
            const req = {
                logout: jest.fn((callback) => callback(new Error('Logout failed'))),
            } as unknown as Request;
            const res = {
                clearCookie: jest.fn(),
                status: jest.fn(() => res),
                json: jest.fn(),
            } as unknown as Response;

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to logout' });
        });
    });

    describe('register', () => {
        it('should register a user and return user data', async () => {
            const registerUserDTO = {
                email: 'test@example.com',
                passwordHash: 'hashedpassword',
                name: 'Test User',
                contactPhone: '+798169342341',
            };

            const newUser = {
                _id: 'someId',
                email: 'test@example.com',
                name: 'Test User',
            };

            mockUsersService.createUser.mockResolvedValue(newUser);

            const result = await authController.register(registerUserDTO);

            expect(result).toEqual({
                id: 'someId',
                email: 'test@example.com',
                name: 'Test User',
            });
        });

        it('should throw BadRequestException if registration fails', async () => {
            const registerUserDTO = {
                email: 'test@example.com',
                passwordHash: 'hashedpassword',
                name: 'Test User',
                contactPhone: '+798169342341',
            };

            mockUsersService.createUser.mockRejectedValue(new Error('Registration failed'));

            await expect(authController.register(registerUserDTO)).rejects.toThrow(BadRequestException);
        });
    });
});
