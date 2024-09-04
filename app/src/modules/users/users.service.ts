import { Injectable } from '@nestjs/common';
import { IUserService, SearchUserParams } from './dto';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService implements IUserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {};

    async create(data: Partial<User>): Promise<User> {
        try {
            const createdUser = new this.userModel(data);
            return await createdUser.save();
        } catch (err) {
            throw err;  
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

            if (params.email) {
                query.email = new RegExp(params.email, "i");
            };

            if (params.name) {
                query.name = new RegExp(params.name, "i");
            };

            if (params.contactPhone) {
                query.contactPhone = new RegExp(params.contactPhone, "i");
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
