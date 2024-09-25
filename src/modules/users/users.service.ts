import { ConflictException, Injectable } from '@nestjs/common';
import { IUserService, SearchUserParams } from './dto';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements IUserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {};

    async createUser(data: Partial<User>): Promise<User> {
        try {
            const existingUser = await this.findByEmail(data.email);
            if (existingUser) throw new ConflictException('Email is already taken');
    
            const hashedPassword = await bcrypt.hash(data.passwordHash, 10);
    
            const newUser = {
                email: data.email,
                passwordHash: hashedPassword,
                name: data.name,
                contactPhone: data.contactPhone,
                role: 'client',
            };
    
            const createdUser = await this.userModel.create(newUser);
            return createdUser;
        } catch (err) {
            if (err instanceof ConflictException) {
                throw new ConflictException('Email is already taken');
            } else {
                throw err;
            };
        };
    };
    
    async createManager(data: Partial<User>): Promise<User> {
        try {
            const existingUser = await this.findByEmail(data.email);
            if (existingUser) throw new ConflictException('Email is already taken');
            
            const hashedPassword = await bcrypt.hash(data.passwordHash, 10);
            
            const newUser = {
                email: data.email,
                passwordHash: hashedPassword,
                name: data.name,
                contactPhone: data.contactPhone,
                role: data.role,
            };
            
            const createdUser = await this.userModel.create(newUser);
            return createdUser;
        } catch (err) {
            if (err instanceof ConflictException) {
                throw new ConflictException('Email is already taken');
            } else {
                throw err;
            };
        };
    };

    async findById(id: Types.ObjectId | string): Promise<User> {
        try {
            return await this.userModel.findById(id).exec();
        } catch (err) {
            throw err;  
        };
    };

    async findByEmail(email: string): Promise<User> {
        try {
            return await this.userModel.findOne({ email }).exec();
        } catch (err) {
            throw err;  
        };
    };

    async findAll(params: SearchUserParams): Promise<User[]> {
        try {
            const query: any = {};

            if (params.email) query.email = new RegExp(params.email, "i");

            if (params.name) query.name = new RegExp(params.name, "i");

            if (params.contactPhone) {
                const escapedPhone = params.contactPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                query.contactPhone = new RegExp(escapedPhone, "i");
            };

            return await this.userModel
                .find(query)
                .skip(params.offset)
                .limit(params.limit)
                .exec();
            
        } catch (err) {
            throw err;  
        };
    };
};
