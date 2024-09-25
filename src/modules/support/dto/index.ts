import { Types } from "mongoose";
import { SupportRequest } from "../models/support-request.model";
import { Message } from "../models/message.model";

type ID = Types.ObjectId | string;

export interface MarkMessagesAsReadDTO {
    user: ID;
    supportRequest: ID;
    createdBefore: Date;
};
  
export interface GetChatListParams {
    user: ID | null;
    isActive: boolean;
};
  
export interface ISupportRequestService {
    findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]>;
    sendMessage(data: SendMessageDTO): Promise<Message>;
    getMessages(supportRequest: ID): Promise<Message[]>;
    subscribe(
      handler: (supportRequest: SupportRequest, message: Message) => void
    ): () => void;
};
  
export interface ISupportRequestClientService {
    createSupportRequest(data: CreateSupportRequestDTO): Promise<SupportRequest>;
    markMessagesAsRead(params: MarkMessagesAsReadDTO);
    getUnreadCount(supportRequest: ID): Promise<number>;
};
  
export interface ISupportRequestEmployeeService {
    markMessagesAsRead(params: MarkMessagesAsReadDTO);
    getUnreadCount(supportRequest: ID): Promise<number>;
    closeRequest(supportRequest: ID): Promise<void>;
};

export interface CreateSupportRequestDTO {
    user: ID;
    text: string;
};

export interface SendMessageDTO {
    author: ID;
    supportRequest: ID;
    text: string;
};

export interface ISupportRequest {
    _id: string;
    userId: string;
    createAt: Date;
    isActive: boolean;
    hasNewMessages: boolean;
};
