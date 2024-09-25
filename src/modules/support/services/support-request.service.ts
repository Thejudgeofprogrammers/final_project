import { Injectable } from "@nestjs/common";
import { GetChatListParams, ISupportRequestService, SendMessageDTO } from "../dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SupportRequest, SupportRequestDocument } from "../models/support-request.model";
import { Message } from "../models/message.model";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class SupportRequestService implements ISupportRequestService {
    constructor(
        @InjectModel(SupportRequest.name) private readonly supportRequestModel: Model<SupportRequestDocument>,
        private eventEmitter: EventEmitter2
    ) {};

    async findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]> {
        try {
            const query: any = {
                ...(params.user && { user: params.user }),
                isActive: params.isActive
            };

            return await this.supportRequestModel.find(query).exec();
        } catch (err) {
            throw err;  
        };
    };

    async findAllByUser(userId: string, query: any) {
        const { limit = 10, offset = 0, isActive } = query;
        const filter: any = { userId };

        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const supportRequests = await this.supportRequestModel
            .find(filter)
            .skip(offset)
            .limit(limit)
            .exec();

        return supportRequests.map(req => ({
            id: req._id,
            createAt: req.createAt,
            isActive: req.isActive,
            hasNewMessages: req.hasNewMessages
        }));
    };

    async findAllForManager(query: any) {
        const { limit = 10, offset = 0, isActive } = query;
        const filter: any = {};

        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const supportRequests = await this.supportRequestModel
            .find(filter)
            .skip(offset)
            .limit(limit)
            .populate('user', 'id name email contactPhone')
            .exec();

        return supportRequests.map((req: any) => ({
            id: req._id,
            createdAt: req.createAt,
            isActive: req.isActive,
            hasNewMessages: req.hasNewMessages,
            client: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                contactPhone: req.user.contactPhone,
            }
        }));
    };

    async sendMessage(data: SendMessageDTO): Promise<Message> {
        try {
            const supportRequest = await this.supportRequestModel.findById(data.supportRequest);
            const message = new Message()
            
            message.author = data.author as Types.ObjectId;
            message.text = data.text;
            message.sentAt = new Date();

            supportRequest.messages.push(message);
            await supportRequest.save();

            this.eventEmitter.emit('message.sent', supportRequest, message);
            return message;
        } catch (err) {
            throw err;
        };
    };

    async getMessages(supportRequest: Types.ObjectId | string): Promise<Message[]> {
        try {
            const request = await this.supportRequestModel.findById(supportRequest).exec();
            return request.messages;
        } catch (err) {
            throw err;
        };
    };

    subscribe(
      handler: (supportRequest: SupportRequest, message: Message) => void
    ): () => void {
        this.eventEmitter.on('message.sent', handler);
        return () => this.eventEmitter.off('message.sent', handler);
    };
};
