import { Types } from "mongoose";
import { Hotel, HotelDocument } from "../models/hotel.model";
import { HotelRoom } from "../models/hotel-room.model";

type ID = Types.ObjectId | string;

export interface SearchHotelParams {
  limit: number;
  offset: number;
  title?: string;
  isEnable?: boolean;
}

export interface UpdateHotelParams {
  title: string;
  description: string;
}

export interface IHotelService {
  create(data: Hotel): Promise<Hotel>;
  findById(id: ID): Promise<Hotel>;
  search(params: SearchHotelParams): Promise<Hotel[]>;
  update(id: ID, data: UpdateHotelParams): Promise<Hotel>;
}

export interface SearchRoomsParams {
  limit: number;
  offset: number;
  hotel: ID;
  isEnable?: boolean;
}

export interface IHotelRoomService {
  create(data: Partial<HotelRoom>): Promise<HotelRoom>;
  findById(id: ID): Promise<HotelRoom>;
  search(params: SearchRoomsParams): Promise<HotelRoom[]>;
  update(id: ID, data: Partial<HotelRoom>): Promise<HotelRoom>;
}

export interface IHotelRoom {
  _id: Types.ObjectId;
  title: string;
  description: string;
}

export interface IHotel {
  _id?: ID;
  hotel: {
    _id: Types.ObjectId;
    title: string;
    description: string;
  };
  description: string;
  images: string[];
}

export interface IHotelParams {
  _id?: Types.ObjectId | string;
  title: string;
  description?: string;
  isEnable?: boolean;
}

export interface HotelWithId extends HotelDocument {
  _id: Types.ObjectId;
}

export interface ICreateHotelRoomDTO {
  title: string;
  description: string;
  hotelId: Types.ObjectId;
}
