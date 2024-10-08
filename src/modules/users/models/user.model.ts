import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    contactPhone: string;

    @Prop({ required: true, default: 'client'})
    role: string;
};

export const UserSchema = SchemaFactory.createForClass(User);
