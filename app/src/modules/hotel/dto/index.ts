import { Types } from "mongoose";
import { Hotel } from "../models/hotel.model";
import { HotelRoom } from "../models/hotel-room.model";

export interface SearchHotelParams {
    limit: number;
    offset: number;
    title: string;
};

export interface UpdateHotelParams {
    title: string;
    description: string;
};

export interface IHotelService {
    create(data: any): Promise<Hotel>;
    findById(id: Types.ObjectId | string): Promise<Hotel>;
    search(params: SearchHotelParams): Promise<Hotel[]>;
    update(id: Types.ObjectId | string, data: UpdateHotelParams): Promise<Hotel>;
};

export interface SearchRoomsParams {
    limit: number;
    offset: number;
    hotel: Types.ObjectId | string;
    isEnable?: boolean;
};

export interface IHotelRoomService {
    create(data: Partial<HotelRoom>): Promise<HotelRoom>;
    findById(id: Types.ObjectId | string): Promise<HotelRoom>;
    search(params: SearchRoomsParams): Promise<HotelRoom[]>;
    update(id: Types.ObjectId | string, data: Partial<HotelRoom>): Promise<HotelRoom>;
};

export interface IHotelRoom {
    _id: Types.ObjectId;
    hotel: Types.ObjectId | IHotelParams;
    description: string;
    image: string[];
    isEnable: boolean;
};

export interface IHotelParams {
    title: string;
    description?: string;
};