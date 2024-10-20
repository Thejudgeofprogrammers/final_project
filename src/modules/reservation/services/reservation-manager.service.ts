import { BadRequestException, Injectable } from "@nestjs/common";
import { IReservationManagerService } from "../dto";
import { InjectModel } from "@nestjs/mongoose";
import { Reservation, ReservationDocument } from "../models/reservation.model";
import { Model, Types } from "mongoose";
import { HTTP_STATUS } from "../../../config/const.config";

@Injectable()
export class ReservationManagerService implements IReservationManagerService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async getReservationsByUser(userId: Types.ObjectId): Promise<Reservation[]> {
    return this.reservationModel
      .find({ userId })
      .populate("roomId", "description images")
      .populate("hotelId", "title description")
      .exec();
  }

  async removeReservationByManager(id: Types.ObjectId | string): Promise<void> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new BadRequestException({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Reservation with the specified ID does not exist!",
      });
    }

    await this.reservationModel.findByIdAndDelete(id);
  }
}
