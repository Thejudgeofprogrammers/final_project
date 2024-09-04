import { Types } from "mongoose";
import { Reservation } from "../models/reservation.model";

export interface ReservationDTO {
    userId: Types.ObjectId | string;
    hotelId: Types.ObjectId | string;
    roomId: Types.ObjectId | string;
    dateStart: Date;
    dateEnd: Date;
};
  
export interface ReservationSearchOptions {
    userId: Types.ObjectId | string;
    dateStart: Date;
    dateEnd: Date;
};

export interface IReservation {
    addReservation(data: ReservationDTO): Promise<Reservation>;
    removeReservation(id: Types.ObjectId | string): Promise<void>;
    getReservations(
      filter: ReservationSearchOptions
    ): Promise<Array<Reservation>>;
};
