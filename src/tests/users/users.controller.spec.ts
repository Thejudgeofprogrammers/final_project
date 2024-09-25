import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../modules/users/users.controller';
import { UsersService } from '../../modules/users/users.service';
import { ConflictException } from '@nestjs/common';
import { UserDTO } from '../../modules/users/dto';

describe('UsersController', () => {
    let usersController: UsersController;
    let usersService: UsersService;

    const mockUsersService = {
        createManager: jest.fn(),
        createUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        controllers: [UsersController],
        providers: [
            {
            provide: UsersService,
            useValue: mockUsersService,
            },
        ],
        }).compile();

        usersController = module.get<UsersController>(UsersController);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUserAdmin', () => {
        it('should create a new manager if email is not taken', async () => {
            const mockData: UserDTO = {
                email: 'admin@example.com',
                passwordHash: 'password',
                name: 'Admin User',
                contactPhone: '+798169342341',
                role: 'admin',
            };

            const mockResponse = {
                ...mockData,
                id: '1',
            };

            mockUsersService.createManager.mockResolvedValue(mockResponse);

            const result = await usersController.createUserAdmin(mockData);

            expect(result).toEqual(mockResponse);
            expect(usersService.createManager).toHaveBeenCalledWith(mockData);
        });

        it('should throw ConflictException if email is already taken', async () => {
            const mockData: UserDTO = {
                email: 'admin@example.com',
                passwordHash: 'password',
                name: 'Admin User',
                contactPhone: '+798169342341',
                role: 'admin',
            };

            mockUsersService.createManager.mockRejectedValue(new ConflictException('Email is already taken!'));

            await expect(usersController.createUserAdmin(mockData)).rejects.toThrow(ConflictException);
            await expect(usersController.createUserAdmin(mockData)).rejects.toThrow('Email is already taken!');
        });

        it('should throw an error if any other error occurs', async () => {
            const mockData: UserDTO = {
                email: 'admin@example.com',
                passwordHash: 'password',
                name: 'Admin User',
                contactPhone: '+798169342341',
                role: 'admin',
            };

            mockUsersService.createManager.mockRejectedValue(new Error('Unexpected error'));

            await expect(usersController.createUserAdmin(mockData)).rejects.toThrow('Unexpected error');
        });

        it('should throw an error if required fields are missing', async () => {
            const mockData: any = {
                email: 'admin@example.com',
            };

            await expect(usersController.createUserAdmin(mockData)).rejects.toThrow();
            expect(usersService.createManager).not.toHaveBeenCalled();
        });

        it('should throw an error if required fields are missing in createUserManager', async () => {
            const mockData: any = {
                email: 'user@example.com',
            };

            await expect(usersController.createUserManager(mockData)).rejects.toThrow('Missing required fields');
            expect(usersService.createUser).not.toHaveBeenCalled();
        });

        it('should throw an error if any other error occurs', async () => {
            const mockData: UserDTO = {
                email: 'admin@example.com',
                passwordHash: 'password',
                name: 'Admin User',
                contactPhone: '+798169342341',
                role: 'admin',
            };

            mockUsersService.createManager.mockRejectedValue(new Error('Unexpected error'));

            await expect(usersController.createUserAdmin(mockData)).rejects.toThrow('Unexpected error');
        });
    });

    describe('createUserManager', () => {
        it('should create a new user if email is not taken', async () => {
            const mockData: UserDTO = {
                email: 'user@example.com',
                passwordHash: 'password',
                name: 'Regular User',
                contactPhone: '+798169342342',
            };

            const mockResponse = {
                ...mockData,
                id: '2',
            };

            mockUsersService.createUser.mockResolvedValue(mockResponse);

            const result = await usersController.createUserManager(mockData);

            expect(result).toEqual(mockResponse);

            expect(usersService.createUser).toHaveBeenCalledWith(mockData);
        });

        it('should throw ConflictException if email is already taken', async () => {
            const mockData: UserDTO = {
                email: 'user@example.com',
                passwordHash: 'password',
                name: 'Regular User',
                contactPhone: '+798169342342',
            };

            mockUsersService.createUser.mockRejectedValue(new ConflictException('Email is already taken'));

            await expect(usersController.createUserManager(mockData)).rejects.toThrow(ConflictException);

            expect(usersService.createUser).toHaveBeenCalledWith(mockData);
        });

        it('should rethrow unexpected errors', async () => {
            const mockData: UserDTO = {
                email: 'user@example.com',
                passwordHash: 'password',
                name: 'Regular User',
                contactPhone: '+798169342342',
            };

            mockUsersService.createUser.mockRejectedValue(new Error('Unexpected error'));

            await expect(usersController.createUserManager(mockData)).rejects.toThrow('Unexpected error');
        });
    });
});
