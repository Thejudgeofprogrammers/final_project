import { Types } from "mongoose";
import { User } from "../models/user.model";

export interface SearchUserParams {
    limit: number;
    offset: number;
    email: string;
    name: string;
    contactPhone: string;
};

export interface IUserService {
    create(data: Partial<User>): Promise<User>;
    findById(id: Types.ObjectId | string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findAll(params: SearchUserParams): Promise<User[]>;
};
