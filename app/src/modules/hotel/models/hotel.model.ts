import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type HotelDocument = Hotel & Document;

@Schema({ timestamps: true }) // Добавляет createAt updateAt
export class Hotel {
    @Prop({ required: true, unique: true })
    title: string;

    @Prop()
    description: string;
};

export const HotelSchema = SchemaFactory.createForClass(Hotel);
