import { Types } from "mongoose";
import { Reservation } from "../models/reservation.model";

type ID = Types.ObjectId | string;

export interface ReservationDTO {
  userId: ID;
  hotelId: ID;
  roomId: ID;
  dateStart: Date;
  dateEnd: Date;
}

export interface ReservationSearchOptions {
  userId: ID;
  dateStart: Date;
  dateEnd: Date;
}

export interface IReservation {
  addReservation(data: ReservationDTO): Promise<Reservation>;
  removeReservation(id: ID, userId: Types.ObjectId): Promise<void>;
  getReservations(
    filter: ReservationSearchOptions,
  ): Promise<Array<Reservation>>;
}

export interface ReservationResponse {
  dateStart: Date;
  dateEnd: Date;
  hotel: Hotel;
  hotelRoom: HotelRoom;
}

export interface IReservationManagerService {
  getReservationsByUser(id: ID): Promise<Reservation[]>;
  removeReservationByManager(id: ID): Promise<void>;
}

export interface HotelRoom {
  description: string;
  images: string[];
}

export interface Hotel {
  title: string;
  description: string;
}
