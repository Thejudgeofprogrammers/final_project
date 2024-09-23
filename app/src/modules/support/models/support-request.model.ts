import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Message, MessageSchema } from "./message.model";

export type SupportRequestDocument = SupportRequest & Document;

@Schema()
export class SupportRequest {
    @Prop({ required: true, unique: true, type: Types.ObjectId })
    user: Types.ObjectId;

    @Prop({ required: true, type: Date, default: Date.now })
    createAt: Date;

    @Prop({ type: [MessageSchema], default: []})
    messages: Message[]; 

    @Prop()
    isActive: boolean;

    @Prop({ default: false })
    hasNewMessages: boolean;
};

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);
