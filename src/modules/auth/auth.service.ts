import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { User } from "../users/models/user.model";
import { HTTP_STATUS } from "../../config/const.config";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, "passwordHash">> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid credentials!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid credentials!",
      });
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}
