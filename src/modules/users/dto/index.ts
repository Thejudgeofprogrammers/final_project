import { Types } from "mongoose";
import { User } from "../models/user.model";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

type ID = Types.ObjectId | string;

export interface SearchUserParams {
    limit: number;
    offset: number;
    email: string | RegExp;
    name: string;
    contactPhone: string;
};

export interface IUserService {
    createUser(data: Partial<User>): Promise<User>;
    createManager(data: Partial<User>): Promise<User>;
    findById(id: ID): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findAll(params: SearchUserParams): Promise<User[]>;
};

export class UserDTO {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    passwordHash: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    contactPhone?: string;

    @IsOptional()
    @IsString()
    role?: string;
};
