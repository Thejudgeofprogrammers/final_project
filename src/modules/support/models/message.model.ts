import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ required: true, type: Types.ObjectId })
  author: Types.ObjectId;

  @Prop({ required: true, type: Date })
  sentAt: Date;

  @Prop({ required: true })
  text: string;

  @Prop({ type: Date })
  readAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
