import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { SearchUserParams } from './dto';
import { ObjectId } from 'mongoose';

@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {};

    @Post('create')
    async create(data: Partial<User>): Promise<User> {
        return this.usersService.create(data);
    };

    @Get(':id')
    async findById(id: ObjectId | string): Promise<User> {
        return this.usersService.findById(id);
    };

    @Get(':email')
    async findByEmail(email: string): Promise<User> {
        return this.usersService.findByEmail(email);
    };

    @Get('')
    async findAll(params: SearchUserParams): Promise<User[]> {
        return this.usersService.findAll(params)
    };
};
