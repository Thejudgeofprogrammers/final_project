import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Reservation, ReservationDocument } from "../models/reservation.model";
import { Model, Types } from "mongoose";
import { IReservation, ReservationDTO, ReservationSearchOptions } from "../dto";
import { HTTP_STATUS } from "../../../config/const.config";

@Injectable()
export class ReservationService implements IReservation {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async addReservation(data: ReservationDTO): Promise<Reservation> {
    const existingReservation = await this.reservationModel.find({
      roomId: data.roomId,
      $or: [
        {
          dateStart: { $lt: data.dateEnd },
          dateEnd: { $gt: data.dateStart },
        },
      ],
    });

    if (existingReservation.length > 0) {
      throw new BadRequestException({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "The selected room is already booked for the specified dates.",
      });
    }

    const savedReservation = await this.reservationModel.create(data);

    return this.reservationModel
      .findById(savedReservation._id)
      .populate([
        { path: "roomId", select: "description images" },
        { path: "hotelId", select: "title description" },
      ])
      .exec();
  }

  async removeReservation(
    id: Types.ObjectId | string,
    userId: Types.ObjectId,
  ): Promise<void> {
    const reservation = await this.reservationModel.findById(id);

    if (!reservation) {
      throw new BadRequestException({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Reservation with the specified ID does not exist.",
      });
    }

    if (reservation.userId.toString() !== userId.toString()) {
      throw new BadRequestException({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "You do not have permission to delete this reservation.",
      });
    }

    await this.reservationModel.findByIdAndDelete(id);
  }

  async getReservations(
    filter: ReservationSearchOptions,
  ): Promise<Array<Reservation>> {
    return await this.reservationModel
      .find({
        userId: filter.userId,
        dateStart: { $gte: filter.dateStart },
        dateEnd: { $gte: filter.dateEnd },
      })
      .exec();
  }
}
