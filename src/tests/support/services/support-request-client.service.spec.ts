import { Test, TestingModule } from "@nestjs/testing";
import { SupportRequestClientService } from "../../../modules/support/services/support-request-client.service";
import { getModelToken } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  CreateSupportRequestDTO,
  MarkMessagesAsReadDTO,
} from "../../../modules/support/dto";
import { mock } from "jest-mock-extended";
import {
  SupportRequestDocument,
  SupportRequest,
} from "../../../modules/support/models/support-request.model";

describe("SupportRequestClientService", () => {
  let service: SupportRequestClientService;
  const supportRequestModelMock = mock<Model<SupportRequestDocument>>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportRequestClientService,
        {
          provide: getModelToken(SupportRequest.name),
          useValue: supportRequestModelMock,
        },
      ],
    }).compile();

    service = module.get<SupportRequestClientService>(
      SupportRequestClientService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createSupportRequest", () => {
    it("should create support request", async () => {
      const supportRequestMock: Partial<SupportRequestDocument> = {
        _id: new Types.ObjectId(),
        user: new Types.ObjectId(),
        messages: [],
        createAt: new Date(),
        isActive: true,
        hasNewMessages: false,
      };
      jest
        .spyOn(supportRequestModelMock, "create")
        .mockResolvedValue(supportRequestMock as any);
      const dto: CreateSupportRequestDTO = {
        user: new Types.ObjectId().toString(),
        text: "Test message",
      };
      const result = await service.createSupportRequest(dto);
      expect(supportRequestModelMock.create).toHaveBeenCalledWith({
        user: expect.any(Types.ObjectId),
        createAt: expect.any(Date),
        messages: [
          {
            author: expect.any(Types.ObjectId),
            sentAt: expect.any(Date),
            text: "Test message",
            readAt: null,
          },
        ],
        isActive: true,
      });
      expect(result).toEqual(supportRequestMock);
    });
  });

  describe("markMessagesAsRead", () => {
    it("should mark unread messages as read", async () => {
      const params: MarkMessagesAsReadDTO = {
        supportRequest: new Types.ObjectId().toString(),
        user: new Types.ObjectId(),
        createdBefore: new Date(Date.now() - 7000),
      };

      const supportRequestMock = {
        _id: params.supportRequest,
        messages: [
          {
            author: new Types.ObjectId(),
            sentAt: new Date(Date.now() - 10000),
            readAt: null,
          },
          {
            author: new Types.ObjectId(),
            sentAt: new Date(Date.now() - 5000),
            readAt: null,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(supportRequestModelMock, "findById")
        .mockResolvedValue(supportRequestMock);

      await service.markMessagesAsRead(params);

      expect(supportRequestMock.messages[0].readAt).not.toBeNull();
      expect(supportRequestMock.messages[1].readAt).toBeNull();
      expect(supportRequestMock.save).toHaveBeenCalled();
    });

    it("should throw an error if finding support request fails", async () => {
      const params: MarkMessagesAsReadDTO = {
        supportRequest: new Types.ObjectId().toString(),
        user: new Types.ObjectId(),
        createdBefore: new Date(),
      };

      jest
        .spyOn(supportRequestModelMock, "findById")
        .mockRejectedValue(new Error("Database error"));

      await expect(service.markMessagesAsRead(params)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("getUnreadCount", () => {
    it("should return the number of unread messages", async () => {
      const supportRequestId = new Types.ObjectId().toString();

      const supportRequestMock = {
        _id: supportRequestId,
        user: new Types.ObjectId(),
        messages: [
          {
            author: new Types.ObjectId(),
            sentAt: new Date(),
            readAt: null,
          },
          {
            author: new Types.ObjectId(),
            sentAt: new Date(),
            readAt: new Date(),
          },
        ],
      };

      jest
        .spyOn(supportRequestModelMock, "findById")
        .mockResolvedValue(supportRequestMock);

      const unreadCount = await service.getUnreadCount(supportRequestId);

      expect(unreadCount).toEqual(1);
    });

    it("should throw an error if finding support request fails", async () => {
      const supportRequestId = new Types.ObjectId().toString();

      jest
        .spyOn(supportRequestModelMock, "findById")
        .mockRejectedValue(new Error("Database error"));

      await expect(service.getUnreadCount(supportRequestId)).rejects.toThrow(
        "Database error",
      );
    });
  });
});
