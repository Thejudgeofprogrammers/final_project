import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, ReservationDocument } from './models/reservation.model';
import { Model, Types } from 'mongoose';
import { IReservation, ReservationDTO, ReservationSearchOptions } from './dto';

@Injectable()
export class ReservationService implements IReservation {
    constructor(
        @InjectModel(Reservation.name) private readonly reservationModel: Model<ReservationDocument>
    ) {};

    async addReservation(data: ReservationDTO): Promise<Reservation> {
        try {
            const existingReservation = await this.reservationModel.find({
                roomId: data.roomId,
                $or: [
                    { dateStart: { $lt: data.dateEnd }, dateEnd: { $gt: data.dateStart }}
                ]
            });

            if (existingReservation.length > 0) {
                throw new BadRequestException('Dont have data!');
            };
            
            const newReservation = new this.reservationModel(data);
            return await newReservation.save();
        } catch (err) {
            throw err;
        };
    };
    
    async removeReservation(id: Types.ObjectId | string): Promise<void> {
        try {
            await this.reservationModel.findByIdAndDelete(id);
        } catch (err) {
            throw err;
        };
    };
    
    async getReservations(
      filter: ReservationSearchOptions
    ): Promise<Array<Reservation>> {
        try {
            return await this.reservationModel.find({
                userId: filter.userId,
                dateStart: { $gte: filter.dateStart},
                dateEnd: { $lte: filter.dateEnd }
            }).exec();
        } catch (err) {
            throw err;
        };
    };
};
