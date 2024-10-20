import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../../decorators/roles.decorator";
import { RoleGuard } from "../../guards/roles-guard";
import { UserDTO } from "./dto";
import { HTTP_STATUS } from "../../config/const.config";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard("session"), RoleGuard)
  @Roles("admin")
  @Post("admin/users")
  async createUserAdmin(@Body() body: UserDTO) {
    const { email, passwordHash, name, contactPhone, role } = body;
    if (!email || !passwordHash || !name || !contactPhone || !role) {
      throw new BadRequestException({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Missing required fields",
      });
    }

    const data = { email, passwordHash, name, contactPhone, role };

    try {
      const newUser = await this.usersService.createManager(data);
      return newUser;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new ConflictException({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Email is already taken!",
        });
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard("session"), RoleGuard)
  @Roles("manager")
  @Post("manager/users")
  async createUserManager(@Body() body: UserDTO) {
    const { email, passwordHash, name, contactPhone } = body;
    if (!email || !passwordHash || !name || !contactPhone) {
      throw new BadRequestException({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Missing required fields",
      });
    }

    const data = { email, passwordHash, name, contactPhone };

    try {
      const newUser = await this.usersService.createUser(data);
      return newUser;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new ConflictException({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Email is already taken!",
        });
      }
      throw err;
    }
  }
}
