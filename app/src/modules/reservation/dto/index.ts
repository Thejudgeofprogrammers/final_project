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
    removeReservation(id: Types.ObjectId | string, userId: Types.ObjectId): Promise<void>;
    getReservations(
      filter: ReservationSearchOptions
    ): Promise<Array<Reservation>>;
};

export interface ReservationResponse {
    dateStart: Date;
    dateEnd: Date;
    hotel: Hotel;
    hotelRoom: HotelRoom;
}

export interface IReservationManagerService {
    getReservationsByUser(id: Types.ObjectId | string): Promise<Reservation[]>;
    removeReservationByManager(id: Types.ObjectId | string): Promise<void>;
};

export interface HotelRoom {
    description: string;
    images: string[];
};

export interface Hotel {
    title: string;
    description: string;
};