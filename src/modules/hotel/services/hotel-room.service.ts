import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HotelRoom } from '../models/hotel-room.model';;
import { Model, Types } from 'mongoose';
import { IHotelRoomService, SearchRoomsParams } from '../dto';

@Injectable()
export class HotelRoomService implements IHotelRoomService {
    constructor(
        @InjectModel(HotelRoom.name) private readonly hotelRoomModel: Model<HotelRoom>
    ) {};

    async create(data: Partial<HotelRoom>): Promise<HotelRoom> {
        try {
            const createdHotelRoom = await this.hotelRoomModel.create(data);
            return await this.hotelRoomModel.findById(createdHotelRoom._id).populate('hotel').exec();
        } catch (err) {
            throw err;
        };
    };

    async findById(id: Types.ObjectId | string): Promise<HotelRoom> {
        try {
            return await this.hotelRoomModel.findById(id).exec();
        } catch (err) {
            throw err;
        };
    };

    async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
        try {
            const query: any = {
                isEnable: true,
            };
          
            if (params.hotel) query.hotel = params.hotel;

            
            return await this.hotelRoomModel
                .find(query)
                .skip(params.offset)
                .limit(params.limit)
                .populate('hotel')
                .exec();
            
        } catch (err) {
            throw err;
        };
    };

    async update(id: Types.ObjectId | string, data: Partial<HotelRoom>): Promise<HotelRoom> {
        try {
            return await this.hotelRoomModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (err) {
            throw err;
        };
    };
};
