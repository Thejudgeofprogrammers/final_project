import { Injectable } from "@nestjs/common";
import {
  GetChatListParams,
  ISupportRequestService,
  SendMessageDTO,
} from "../dto";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import {
  SupportRequest,
  SupportRequestDocument,
} from "../models/support-request.model";
import { Message } from "../models/message.model";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { User } from "@/modules/users/models/user.model";

@Injectable()
export class SupportRequestService implements ISupportRequestService {
  constructor(
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findSupportRequests(
    params: GetChatListParams,
  ): Promise<SupportRequest[]> {
    const query: FilterQuery<SupportRequest> = {
      ...(params.user && { user: params.user }),
      isActive: params.isActive,
    };

    return await this.supportRequestModel.find(query).exec();
  }

  async findAllByUser(userId: string, query) {
    const { limit = 10, offset = 0, isActive } = query;
    const filter: FilterQuery<SupportRequest> = { user: userId };

    if (isActive !== undefined) filter.isActive = isActive === "true";

    const supportRequests = await this.supportRequestModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .exec();

    return supportRequests.map((req) => ({
      id: req._id,
      createAt: req.createAt,
      isActive: req.isActive,
      hasNewMessages: req.hasNewMessages,
    }));
  }

  async findAllForManager(query) {
    const { limit = 10, offset = 0, isActive } = query;
    const filter: FilterQuery<SupportRequest> = {};

    if (isActive !== undefined) filter.isActive = isActive === "true";

    const supportRequests = await this.supportRequestModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .populate("user", "name email contactPhone")
      .exec();

    return supportRequests.map((req) => {
      const user =
        req.user instanceof Types.ObjectId ? null : (req.user as User);
      return {
        id: req._id,
        createdAt: req.createAt,
        isActive: req.isActive,
        hasNewMessages: req.hasNewMessages,
        client: user
          ? {
              id: req.user._id,
              name: user.name,
              email: user.email,
              contactPhone: user.contactPhone,
            }
          : null,
      };
    });
  }

  async sendMessage(data: SendMessageDTO): Promise<Message> {
    const supportRequest = await this.supportRequestModel.findById(
      data.supportRequest,
    );
    const message = new Message();

    message.author = data.author as Types.ObjectId;
    message.text = data.text;
    message.sentAt = new Date();

    supportRequest.messages.push(message);
    await supportRequest.save();

    this.eventEmitter.emit("message.sent", supportRequest, message);
    return message;
  }

  async getMessages(
    supportRequest: Types.ObjectId | string,
  ): Promise<Message[]> {
    const request = await this.supportRequestModel
      .findById(supportRequest)
      .exec();
    return request.messages;
  }

  subscribe(
    handler: (supportRequest: SupportRequest, message: Message) => void,
  ): () => void {
    this.eventEmitter.on("message.sent", handler);
    return () => this.eventEmitter.off("message.sent", handler);
  }
}
