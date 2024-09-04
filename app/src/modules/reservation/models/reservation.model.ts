import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation {
    @Prop({ required: true, type: Types.ObjectId })
    userId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId})
    hotelId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId })
    roomId: Types.ObjectId;

    @Prop({ required: true, type: Date })
    dateStart: Date;

    @Prop({ required: true, type: Date })
    dateEnd: Date;
};

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
