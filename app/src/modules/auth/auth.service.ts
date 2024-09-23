import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/models/user.model';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {};

    async validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'>> {
        const user: any = await this.usersService.findByEmail(email);
        
        if (!user) {
            throw new UnauthorizedException('Invalid credentials!');
        };

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);;
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials!');
        };

        const { password: userPassword, ...result } = user;

        return result;
    };
};
