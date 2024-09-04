import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hotel, HotelDocument } from '../models/hotel.model';
import { Model, Types } from 'mongoose';
import { IHotelService, SearchHotelParams, UpdateHotelParams } from '../dto';

@Injectable()
export class HotelService implements IHotelService {
    constructor(
        @InjectModel(Hotel.name) private readonly hotelModel: Model<HotelDocument>
    ) {};

    async create(data: any): Promise<Hotel> {
        try {
            const createdHotel = new this.hotelModel(data);
            return await createdHotel.save();
        } catch (err) {
            throw err;  
        };
    };

    async findById(id: Types.ObjectId | string): Promise<Hotel> {
        try {
            return await this.hotelModel.findById(id).exec();
        } catch (err) {
            throw err;
        };
    };

    async search(params: SearchHotelParams): Promise<Hotel[]> {
        try {
            const query: any = {};

            if (params.title) {
                query.title = new RegExp(params.title, 'i');
            };

            return await this.hotelModel
                .find(query)
                .skip(params.offset)
                .limit(params.limit)
                .exec();
            
        } catch (err) {
            throw err;
        };
    };

    async update(id: Types.ObjectId | string, data: UpdateHotelParams): Promise<Hotel> {
        try {
            return await this.hotelModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (err) {
            throw err;
        };
    };
};
