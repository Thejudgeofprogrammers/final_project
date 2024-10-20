import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HotelRoom } from "../models/hotel-room.model";
import { FilterQuery, Model, Types } from "mongoose";
import { IHotelRoomService, SearchRoomsParams } from "../dto";
import { Hotel } from "../models/hotel.model";

@Injectable()
export class HotelRoomService implements IHotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly hotelRoomModel: Model<HotelRoom>,
  ) {}

  async create(data: Partial<HotelRoom>): Promise<HotelRoom> {
    const createdHotelRoom = await this.hotelRoomModel.create(data);
    return await this.hotelRoomModel
      .findById(createdHotelRoom._id)
      .populate("hotel")
      .exec();
  }

  async findByIdWithHotel(id: Types.ObjectId | string): Promise<HotelRoom> {
    return this.hotelRoomModel.findById(id).populate("hotel").exec() as Promise<
      HotelRoom & { hotel: Hotel }
    >;
  }

  async findById(id: Types.ObjectId | string): Promise<HotelRoom> {
    return await this.hotelRoomModel.findById(id).populate("hotel").exec();
  }

  async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
    const query: FilterQuery<HotelRoom> = {};

    if (params.isEnable !== undefined) {
      query.isEnable = params.isEnable;
    }

    if (params.hotel) query.hotel = params.hotel;

    return await this.hotelRoomModel
      .find(query)
      .skip(params.offset)
      .limit(params.limit)
      .populate("hotel")
      .exec();
  }

  async update(
    id: Types.ObjectId | string,
    data: Partial<HotelRoom>,
  ): Promise<HotelRoom> {
    return await this.hotelRoomModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }
}
