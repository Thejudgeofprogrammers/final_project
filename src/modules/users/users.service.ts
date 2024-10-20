import { ConflictException, Injectable } from "@nestjs/common";
import { IUserService, SearchUserParams } from "./dto";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "./models/user.model";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { HTTP_STATUS } from "../../config/const.config";

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(data: Partial<User>): Promise<UserDocument> {
    try {
      const existingUser = await this.findByEmail(data.email);
      const existingUserPhone = await this.findByContactPhone(
        data.contactPhone,
      );
      if (existingUser || existingUserPhone) {
        throw new ConflictException({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Email is already taken!",
        });
      }

      const newUser = {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        contactPhone: data.contactPhone,
        role: "client",
      };

      const createdUser = await this.userModel.create(newUser);
      return createdUser;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new ConflictException({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Email is already taken!",
        });
      } else {
        throw err;
      }
    }
  }

  async createManager(data: Partial<User>): Promise<User> {
    try {
      const existingUser = await this.findByEmail(data.email);
      const existingUserPhone = await this.findByContactPhone(
        data.contactPhone,
      );
      if (existingUser || existingUserPhone) {
        throw new ConflictException({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Email is already taken!",
        });
      }

      const hashedPassword = await bcrypt.hash(data.passwordHash, 10);

      const newUser = {
        email: data.email,
        passwordHash: hashedPassword,
        name: data.name,
        contactPhone: data.contactPhone,
        role: "manager",
      };

      const createdUser = await this.userModel.create(newUser);
      return createdUser;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new ConflictException({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Email is already taken!",
        });
      } else {
        throw err;
      }
    }
  }

  async findById(id: Types.ObjectId | string): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByContactPhone(contactPhone: string): Promise<User> {
    return await this.userModel.findOne({ contactPhone }).exec();
  }

  async findAll(params: SearchUserParams): Promise<User[]> {
    const query: Partial<SearchUserParams> = {};

    if (params.email) query.email = new RegExp(params.email, "i");

    if (params.name) query.name = new RegExp(params.name, "i");

    if (params.contactPhone && typeof params.contactPhone === "string") {
      const escapedPhone = params.contactPhone.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      query.contactPhone = new RegExp(escapedPhone, "i");
    }

    return await this.userModel
      .find(query)
      .skip(params.offset || 0)
      .limit(params.limit || 10)
      .exec();
  }
}
