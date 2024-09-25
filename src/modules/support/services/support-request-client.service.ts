import { Injectable } from "@nestjs/common";
import { CreateSupportRequestDTO, ISupportRequestClientService, MarkMessagesAsReadDTO } from "../dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SupportRequest, SupportRequestDocument } from "../models/support-request.model";
import { Message } from "../models/message.model";

@Injectable()
export class SupportRequestClientService implements ISupportRequestClientService {
    constructor(
        @InjectModel(SupportRequest.name) private supportRequestModel: Model<SupportRequestDocument>,
    ) {};

    async createSupportRequest(dto: CreateSupportRequestDTO): Promise<SupportRequest> {
        const message: Message = {
            author: new Types.ObjectId(dto.user),
            sentAt: new Date(),
            text: dto.text,
            readAt: null,
        };
    
        const supportRequest = await this.supportRequestModel.create({
            user: new Types.ObjectId(dto.user),
            createAt: new Date(),
            messages: [message],
            isActive: true,
        });
    
        return supportRequest;
    };

    async markMessagesAsRead(params: MarkMessagesAsReadDTO) {
        try {
            const supportRequest = await this.supportRequestModel.findById(params.supportRequest);
            supportRequest.messages.forEach(message => {
                if (
                    !message.readAt &&
                    !message.author.equals(params.user) &&
                    message.sentAt < params.createdBefore
                ) {
                    message.readAt = new Date();
                };
            });
            await supportRequest.save();
        } catch (err) {
            throw err;
        };
    };
    
    async getUnreadCount(supportRequest: Types.ObjectId | string): Promise<number> {
        try {
            const request = await this.supportRequestModel.findById(supportRequest);
            return request.messages.filter(
                message => !message.readAt && !message.author.equals(request.user)
            ).length;
        } catch (err) {
            throw err;
        };
    };
};
