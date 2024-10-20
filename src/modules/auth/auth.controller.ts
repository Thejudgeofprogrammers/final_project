import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Session,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IRegisterUserDTO } from "./dtos";
import { UsersService } from "../users/users.service";
import { HTTP_STATUS } from "../../config/const.config";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post("auth/login")
  async login(@Req() req, @Body() body, @Session() session) {
    const { email, password } = body;

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    await new Promise<void>((resolve, reject) => {
      req.login(user, (err) => {
        if (err) {
          console.log("Error during login:", err);
          reject(err);
        } else {
          console.log("Login successful, user session set:", user);
          session.role = user.role;
          resolve();
        }
      });
    });

    const { email: userEmail, name, contactPhone } = (user as any)._doc;

    return {
      email: userEmail,
      name,
      contactPhone,
    };
  }

  @UseGuards(AuthGuard("session"))
  @Post("auth/logout")
  async logout(@Req() req, @Res() res) {
    try {
      await new Promise<void>((resolve, reject) => {
        req.logout((err: Error) => {
          if (err) reject(err);
          resolve();
        });
      });
      res.clearCookie("connect.sid");
      res.status(HTTP_STATUS.OK).send();
    } catch (err) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to logout" });
    }
  }

  @Post("client/register")
  async register(@Body() registerUserDTO: IRegisterUserDTO) {
    const { email, password, name, contactPhone } = registerUserDTO;

    if (!email || !password || !name || !contactPhone) {
      throw new BadRequestException("All fields are required.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      email,
      passwordHash: hashedPassword,
      name,
      contactPhone,
      role: "client",
    };

    try {
      const newUser = await this.usersService.createUser(data);
      return {
        id: (newUser as any)._id.toString(),
        email: newUser.email,
        name: newUser.name,
      };
    } catch (err) {
      throw new BadRequestException({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Registration failed",
      });
    }
  }
}
