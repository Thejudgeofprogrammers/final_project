import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { HotelRoom } from "../../../modules/hotel/models/hotel-room.model";
import { Hotel } from "../../../modules/hotel/models/hotel.model";
import { User } from "../../../modules/users/models/user.model";

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId | User;

  @Prop({ required: true, type: Types.ObjectId, ref: "Hotel" })
  hotelId: Types.ObjectId | Hotel;

  @Prop({ required: true, type: Types.ObjectId, ref: "HotelRoom" })
  roomId: Types.ObjectId | HotelRoom;

  @Prop({ required: true, type: Date })
  dateStart: Date;

  @Prop({ required: true, type: Date })
  dateEnd: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
