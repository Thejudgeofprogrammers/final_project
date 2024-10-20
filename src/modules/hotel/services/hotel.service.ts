import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Hotel, HotelDocument } from "../models/hotel.model";
import { FilterQuery, Model, Types } from "mongoose";
import {
  IHotelParams,
  IHotelService,
  SearchHotelParams,
  UpdateHotelParams,
} from "../dto";
import { HTTP_STATUS } from "../../../config/const.config";

@Injectable()
export class HotelService implements IHotelService {
  constructor(
    @InjectModel(Hotel.name) private readonly hotelModel: Model<HotelDocument>,
  ) {}

  async create(hotelParams: IHotelParams): Promise<HotelDocument> {
    const newHotel = await this.hotelModel.create({
      ...hotelParams,
      isEnable: hotelParams.isEnable ?? undefined,
    });
    return newHotel;
  }

  async findById(id: Types.ObjectId | string): Promise<Hotel> {
    const hotel = await this.hotelModel.findById(id).exec();
    if (!hotel) {
      throw new NotFoundException({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Hotel not found",
      });
    }

    return hotel;
  }

  async search(params: SearchHotelParams): Promise<Hotel[]> {
    const query: FilterQuery<Hotel> = {};

    if (params.title) query.title = new RegExp(params.title, "i");

    if (typeof params.isEnable !== "undefined") {
      query.isEnable = params.isEnable;
    }

    return await this.hotelModel
      .find(query)
      .skip(params.offset)
      .limit(params.limit)
      .exec();
  }

  async update(
    id: Types.ObjectId | string,
    data: UpdateHotelParams,
  ): Promise<Hotel> {
    return await this.hotelModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }
}
