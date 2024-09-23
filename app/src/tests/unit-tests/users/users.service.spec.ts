import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../modules/users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { User } from '../../../modules/users/models/user.model';
import { Model } from 'mongoose';
import { SearchUserParams } from '../../../modules/users/dto';

describe('UsersService', () => {
    let usersService: UsersService;
    let userModel: Model<User>;

    const mockUserModel = {
        findOne: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        }),
        create: jest.fn().mockImplementation((data) => {
            const user = {
                ...data,
                save: jest.fn().mockResolvedValue(data),
            };
            return user;
        }),
        findById: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        }),
        find: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([]),
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userModel = module.get<Model<User>>(getModelToken(User.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        
        it('should create a new user if email is not taken', async () => {
            const mockData = {
                email: 'test@example.com',
                passwordHash: 'password',
                name: 'Test User',
                contactPhone: '+798169342341',
                role: 'client',
            };
        
            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
        
            const result = await usersService.createUser(mockData);
        
            expect(result.email).toEqual(mockData.email);
            expect(result.name).toEqual(mockData.name);
            expect(result.contactPhone).toEqual(mockData.contactPhone);
            expect(result.role).toEqual(mockData.role);
            
            expect(result.passwordHash).toMatch(/\$2a\$10\$/);
        
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockData.email });
        });

        it('should throw ConflictException if email is already taken', async () => {
            const mockData = {
                email: 'test@example.com',
                passwordHash: 'password',
                name: 'Test User',
                contactPhone: '+798169342341',
                role: 'client',
            };

            mockUserModel.findOne.mockReturnValueOnce({
                exec: jest.fn().mockResolvedValue(mockData),
            });

            await expect(usersService.createUser(mockData)).rejects.toThrow(ConflictException);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockData.email });
        });

        it('should rethrow any unexpected error', async () => {
            const mockData = {
                email: 'unexpected@example.com',
                passwordHash: 'password',
                name: 'Unexpected User',
                contactPhone: '+798169342343',
                role: 'client',
            };
    
            mockUserModel.findOne.mockImplementationOnce(() => ({
                exec: jest.fn().mockRejectedValue(new Error('Database error')),
              }));
    
            await expect(usersService.createUser(mockData)).rejects.toThrow('Database error');
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockData.email });
        });

    });

    describe('createManager', () => {
        it('should create a new manager if email is not taken', async () => {
            const mockData = {
                email: 'manager@example.com',
                passwordHash: 'password',
                name: 'Manager User',
                contactPhone: '+798169342342',
                role: 'manager',
            };
            
            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
    
            const result = await usersService.createManager(mockData);
            
            expect(result.email).toEqual(mockData.email);
            expect(result.name).toEqual(mockData.name);
            expect(result.contactPhone).toEqual(mockData.contactPhone);
            expect(result.role).toEqual(mockData.role);
            
            expect(result.passwordHash).toMatch(/\$2a\$10\$/);
    
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockData.email });
            expect(mockUserModel.create).toHaveBeenCalledWith(expect.objectContaining({
                email: mockData.email,
                passwordHash: expect.any(String),
                name: mockData.name,
                contactPhone: mockData.contactPhone,
                role: mockData.role,
            }));
        });
    
        it('should throw an error if an unexpected error occurs during manager creation', async () => {
            const mockData = {
                email: 'manager@example.com',
                passwordHash: 'password',
                name: 'Manager User',
                contactPhone: '+798169342342',
            };
        
            mockUserModel.create.mockRejectedValue(new Error('Unexpected error'));
            await expect(usersService.createManager(mockData)).rejects.toThrow('Unexpected error');
        
            expect(mockUserModel.create).toHaveBeenCalledWith(expect.objectContaining({
                email: mockData.email,
            }));
        });

        it('should throw ConflictException if email is already taken', async () => {
            const mockData = {
                email: 'manager@example.com',
                passwordHash: 'password',
                name: 'Manager User',
                contactPhone: '+798169342342',
                role: 'manager',
            };
    
            mockUserModel.findOne.mockReturnValueOnce({
                exec: jest.fn().mockResolvedValue(mockData),
            });
    
            await expect(usersService.createManager(mockData)).rejects.toThrow(ConflictException);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: mockData.email });
        });
    });

    describe('findByEmail', () => {
        it('should rethrow any unexpected error', async () => {
            mockUserModel.findOne.mockImplementationOnce(() => ({
                exec: jest.fn().mockRejectedValue(new Error('Database error')),
            }));
            await expect(usersService.findByEmail('error@example.com')).rejects.toThrow('Database error');
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'error@example.com' });
        });

        it('should return user if found by email', async () => {
            const mockUser = {
                email: 'test@example.com',
                name: 'Test User',
                contactPhone: '+798169342341',
                role: 'client',
            };

            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await usersService.findByEmail('test@example.com');

            expect(result).toEqual(mockUser);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });
        
        it('should return null if user is not found', async () => {
            mockUserModel.findOne.mockReturnValueOnce({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await usersService.findByEmail('notfound@example.com');

            expect(result).toBeNull();
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'notfound@example.com' });
        });
    });

    describe('findById', () => {
        it('should return user if found by ID', async () => {
            const mockUser = { _id: '123', email: 'test@example.com' };
    
            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            });
    
            const result = await usersService.findById('123');
            expect(result).toEqual(mockUser);
            expect(mockUserModel.findById).toHaveBeenCalledWith('123');
        });

        it('should return null if user is not found by ID', async () => {
            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
        
            const result = await usersService.findById('invalid-id');
            expect(result).toBeNull();
            expect(mockUserModel.findById).toHaveBeenCalledWith('invalid-id');
        });

        it('should rethrow any unexpected error', async () => {
            mockUserModel.findById.mockImplementationOnce(() => ({
                exec: jest.fn().mockRejectedValue(new Error('Database error')),
            }));
            await expect(usersService.findById('error-id')).rejects.toThrow('Database error');
            expect(mockUserModel.findById).toHaveBeenCalledWith('error-id');
        });

        it('should return null if user is not found by ID', async () => {
            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
    
            const result = await usersService.findById('non-existent-id');
            expect(result).toBeNull();
            expect(mockUserModel.findById).toHaveBeenCalledWith('non-existent-id');
        });
    });

    describe('findAll', () => {
        it('should return all users when no search parameters are provided', async () => {
            const mockUsers = [
                { email: 'test1@example.com', name: 'User 1' },
                { email: 'test2@example.com', name: 'User 2' },
            ];
        
            mockUserModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockUsers),
            });
        
            const result = await usersService.findAll({ limit: 10, offset: 0, email: '', name: '', contactPhone: '' });
        
            expect(result).toEqual(mockUsers);
            expect(mockUserModel.find).toHaveBeenCalledWith({});
        });    

        it('should return users matching the search params', async () => {
            const mockParams: SearchUserParams = {
                email: 'test@example.com',
                name: 'Test User',
                contactPhone: '+798169342341',
                offset: 0,
                limit: 10,
            };

            const mockUsers = [
                { email: 'test@example.com', name: 'Test User', contactPhone: '+798169342341' },
            ];

            jest.spyOn(usersService['userModel'], 'find').mockReturnValueOnce({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce(mockUsers),
            } as any);

            const result = await usersService.findAll(mockParams);
            expect(result).toEqual(mockUsers);

            const escapedPhone = mockParams.contactPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            expect(usersService['userModel'].find).toHaveBeenCalledWith({
                email: new RegExp(mockParams.email, 'i'),
                name: new RegExp(mockParams.name, 'i'),
                contactPhone: new RegExp(escapedPhone, 'i'),
            });
        });

        it('should throw an error if an exception occurs', async () => {
            const mockParams: SearchUserParams = {
                email: 'test@example.com',
                name: 'Test User',
                contactPhone: '+798169342341',
                offset: 0,
                limit: 10,
            };

            jest.spyOn(usersService['userModel'], 'find').mockImplementationOnce(() => {
                throw new Error('Database error');
            });

            await expect(usersService.findAll(mockParams)).rejects.toThrow('Database error');
        });

        it('should return an array of users based on search params', async () => {
            const mockUsers = [
                {
                    email: 'test1@example.com',
                    name: 'User 1',
                },
                {
                    email: 'test2@example.com',
                    name: 'User 2',
                },
            ];
    
            const searchParams = {
                limit: 10,
                offset: 0,
                email: /test/i,
                name: '',
                contactPhone: '',
            };
    
            mockUserModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockUsers),
            });
    
            const result = await usersService.findAll(searchParams);
            const query: any = {};
            if (searchParams.email) {
                query.email = new RegExp(searchParams.email, "i");
            }
            if (searchParams.name) {
                query.name = new RegExp(searchParams.name, "i");
            }
            if (searchParams.contactPhone) {
                query.contactPhone = new RegExp(searchParams.contactPhone, "i");
            }
    
            expect(result).toEqual(mockUsers);
            expect(mockUserModel.find).toHaveBeenCalledWith(expect.objectContaining(query));
        });
    });
});
