import { Injectable } from "@nestjs/common";
import { ISupportRequestEmployeeService, MarkMessagesAsReadDTO } from "../dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  SupportRequest,
  SupportRequestDocument,
} from "../models/support-request.model";

@Injectable()
export class SupportRequestEmployeeService
  implements ISupportRequestEmployeeService
{
  constructor(
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
  ) {}

  async markMessagesAsRead(params: MarkMessagesAsReadDTO) {
    const supportRequest = await this.supportRequestModel.findById(
      params.supportRequest,
    );
    supportRequest.messages.forEach((message) => {
      if (
        !message.readAt &&
        message.author.equals(params.user) &&
        message.sentAt < params.createdBefore
      ) {
        message.readAt = new Date();
      }
    });
    await supportRequest.save();
  }

  async getUnreadCount(
    supportRequest: Types.ObjectId | string,
  ): Promise<number> {
    const request = await this.supportRequestModel.findById(supportRequest);
    return request.messages.filter(
      (message) => !message.readAt && !message.author.equals(request.user),
    ).length;
  }

  async closeRequest(supportRequest: Types.ObjectId | string): Promise<void> {
    await this.supportRequestModel.findByIdAndUpdate(supportRequest, {
      isActive: false,
    });
  }
}
