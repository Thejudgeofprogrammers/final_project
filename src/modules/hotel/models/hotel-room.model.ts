import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Hotel } from "./hotel.model";

export type HotelRoomDocument = HotelRoom & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class HotelRoom {
  @Prop({ type: Types.ObjectId, ref: "Hotel", required: true })
  hotel: Types.ObjectId | Hotel;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, default: true })
  isEnable: boolean;

  _id: Types.ObjectId;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);
