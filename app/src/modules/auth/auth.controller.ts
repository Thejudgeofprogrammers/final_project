import { BadRequestException, Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IRegisterUserDTO } from './dtos';
import { UsersService } from '../users/users.service';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService
    ) {};

    @UseGuards(AuthGuard('session'))
    @Post('login')
    async login(@Req() req: any) {
        req.login(req.user, (err) => {
            if (err) {
                throw new UnauthorizedException('Login failed');
            };

            req.session.role = req.user.role;
        });
        return {
            email: req.user.email,
            name: req.user.name,
            contactPhone: req.user.contactPhone
        };
    };

    @UseGuards(AuthGuard('session'))
    @Post('logout')
    async logout(@Req() req: any, @Res() res: any) {
        try {
            await new Promise<void>((resolve, reject) => {
                req.logout((err: Error) => {
                    if (err) {
                        reject(err);
                    };
                    resolve();
                });
            });
            res.clearCookie('connect.sid');
            res.status(200).send();
        } catch (err) {
            return res.status(500).json({ message: 'Failed to logout' });
        };
    };

    @Post('register')
    async register(
        @Body() registerUserDTO: IRegisterUserDTO
    ) {
        const { email, passwordHash, name, contactPhone, role } = registerUserDTO;
        const data = {
            email,
            passwordHash,
            name,
            contactPhone,
            role: role || 'client'
        };
        try {
            const newUser = await this.usersService.createUser(data);
            return {
                id: (newUser as any)._id,
                email: newUser.email,
                name: newUser.name
            };
        } catch (err) {
            throw new BadRequestException('Registration failed');
        };
    };
};
