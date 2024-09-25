import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from '../../modules/users/users.module';
import { UsersService } from '../../modules/users/users.service';
import { UsersController } from '../../modules/users/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../modules/users/models/user.model';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('UsersModule', () => {
    let module: TestingModule;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                UsersModule,
            ],
        }).compile();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should be defined', () => {
        const usersService = module.get<UsersService>(UsersService);
        const usersController = module.get<UsersController>(UsersController);

        expect(usersService).toBeDefined();
        expect(usersController).toBeDefined();
    });

    it('should provide User model', () => {
        const userModel = module.get(getModelToken(User.name));
        expect(userModel).toBeDefined();
    });
});
