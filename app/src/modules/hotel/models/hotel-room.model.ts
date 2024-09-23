import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type HotelRoomDocument = HotelRoom & Document & { _id: Types.ObjectId };;

@Schema({ timestamps: true })
export class HotelRoom {
    @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
    hotel: Types.ObjectId;

    @Prop()
    description: string;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ required: true, default: true })
    isEnable: boolean;
};

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);
