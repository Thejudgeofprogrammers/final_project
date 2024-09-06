import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type HotelDocument = Hotel & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Hotel {
    @Prop({ required: true, unique: true })
    title: string;

    @Prop()
    description: string;
};

export const HotelSchema = SchemaFactory.createForClass(Hotel);
