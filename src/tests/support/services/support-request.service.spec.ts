import { Test, TestingModule } from "@nestjs/testing";
import { SupportRequestService } from "../../../modules/support/services/support-request.service";
import { getModelToken } from "@nestjs/mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  SupportRequest,
  SupportRequestDocument,
} from "../../../modules/support/models/support-request.model";
import { Message } from "../../../modules/support/models/message.model";

describe("SupportRequestService", () => {
  let service: SupportRequestService;
  let supportRequestModel;
  let eventEmitter: EventEmitter2;

  const mockSupportRequestModel = {
    find: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    populate: jest.fn(),
    exec: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportRequestService,
        {
          provide: getModelToken(SupportRequest.name),
          useValue: mockSupportRequestModel,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<SupportRequestService>(SupportRequestService);
    supportRequestModel = module.get(getModelToken(SupportRequest.name));
    eventEmitter = module.get(EventEmitter2);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findSupportRequests", () => {
    it("should return an array of support requests", async () => {
      const mockRequests = [{ _id: "1", user: "user1", isActive: true }];
      mockSupportRequestModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequests),
      });

      const result = await service.findSupportRequests({
        user: "user1",
        isActive: true,
      });
      expect(result).toEqual(mockRequests);
      expect(mockSupportRequestModel.find).toHaveBeenCalledWith({
        user: "user1",
        isActive: true,
      });
    });

    it("should throw an error if findSupportRequests fails", async () => {
      mockSupportRequestModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(
        service.findSupportRequests({ user: "123", isActive: true }),
      ).rejects.toThrow("Database error");
    });
  });

  describe("sendMessage", () => {
    it("should send a message and emit an event", async () => {
      const mockRequest = {
        _id: "support-request-id",
        messages: [],
        save: jest.fn(),
      };
      const sendMessageDto = {
        author: "author-id",
        supportRequest: "support-request-id",
        text: "Hello",
      };

      mockSupportRequestModel.findById.mockResolvedValue(mockRequest);

      const result = await service.sendMessage(sendMessageDto);

      expect(result).toBeInstanceOf(Message);
      expect(mockRequest.messages).toContainEqual(
        expect.objectContaining({ text: "Hello" }),
      );
      expect(mockRequest.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "message.sent",
        mockRequest,
        expect.any(Message),
      );
    });

    it("should throw an error if sendMessage fails", async () => {
      supportRequestModel.findById.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        service.sendMessage({
          supportRequest: "123",
          author: "user123",
          text: "Hello",
        }),
      ).rejects.toThrow("Database error");
    });
  });

  describe("getMessages", () => {
    it("should return messages of a support request", async () => {
      const mockMessages = [new Message(), new Message()];
      const mockRequest = { messages: mockMessages };

      mockSupportRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequest),
      });

      const result = await service.getMessages("support-request-id");

      expect(result).toEqual(mockMessages);
      expect(mockSupportRequestModel.findById).toHaveBeenCalledWith(
        "support-request-id",
      );
    });

    it("should throw an error if getMessages fails", async () => {
      mockSupportRequestModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(service.getMessages("supportRequest123")).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("subscribe", () => {
    it("should add and remove event listener", () => {
      const handler = jest.fn();
      const unsubscribe = service.subscribe(handler);

      expect(eventEmitter.on).toHaveBeenCalledWith("message.sent", handler);

      unsubscribe();

      expect(eventEmitter.off).toHaveBeenCalledWith("message.sent", handler);
    });
  });

  describe("findAllByUser", () => {
    it("should return support requests filtered by userId", async () => {
      const mockRequests = [
        {
          _id: "1",
          user: "user1",
          createAt: new Date(),
          isActive: true,
          hasNewMessages: false,
        },
      ];
      const query = { limit: 10, offset: 0, isActive: "true" };

      mockSupportRequestModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        }),
      });

      const result = await service.findAllByUser("user1", query);

      expect(result).toEqual(
        mockRequests.map((req) => ({
          id: req._id,
          createAt: req.createAt,
          isActive: req.isActive,
          hasNewMessages: req.hasNewMessages,
        })),
      );
      expect(mockSupportRequestModel.find).toHaveBeenCalledWith({
        user: "user1",
        isActive: true,
      });
    });

    it("should use default values for limit and offset", async () => {
      const mockRequests = [
        {
          _id: "1",
          userId: "user1",
          createAt: new Date(),
          isActive: true,
          hasNewMessages: false,
        },
      ];

      mockSupportRequestModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        }),
      });

      const result = await service.findAllByUser("user1", {});

      expect(result).toEqual(
        mockRequests.map((req) => ({
          id: req._id,
          createAt: req.createAt,
          isActive: req.isActive,
          hasNewMessages: req.hasNewMessages,
        })),
      );
      expect(mockSupportRequestModel.find).toHaveBeenCalledWith({
        user: "user1",
        isActive: true,
      });
    });

    it("should respect limit and offset from query", async () => {
      const mockRequests = [
        {
          _id: "1",
          user: "user1",
          createAt: new Date(),
          isActive: true,
          hasNewMessages: false,
        },
      ];
      const query = { limit: 5, offset: 2, isActive: "true" };

      mockSupportRequestModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        }),
      });

      const result = await service.findAllByUser("user1", query);

      expect(result).toEqual(
        mockRequests.map((req) => ({
          id: req._id,
          createAt: req.createAt,
          isActive: req.isActive,
          hasNewMessages: req.hasNewMessages,
        })),
      );
      expect(mockSupportRequestModel.find).toHaveBeenCalledWith({
        user: "user1",
        isActive: true,
      });
    });
  });

  describe("findAllForManager", () => {
    it("should return support requests for managers", async () => {
      const mockRequests = [
        {
          _id: "1",
          createAt: new Date(),
          isActive: true,
          hasNewMessages: false,
          user: {
            _id: "user1",
            name: "User One",
            email: "user1@example.com",
            contactPhone: "1234567890",
          },
        },
        {
          _id: "2",
          createAt: new Date(),
          isActive: true,
          hasNewMessages: true,
          user: {
            _id: "user2",
            name: "User Two",
            email: "user2@example.com",
            contactPhone: "0987654321",
          },
        },
      ];
      const query = { limit: 10, offset: 0, isActive: "true" };

      mockSupportRequestModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRequests),
            }),
          }),
        }),
      });

      const result = await service.findAllForManager(query);

      expect(result).toEqual(
        mockRequests.map((req) => ({
          id: req._id,
          createdAt: req.createAt,
          isActive: req.isActive,
          hasNewMessages: req.hasNewMessages,
          client: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            contactPhone: req.user.contactPhone,
          },
        })),
      );
      expect(mockSupportRequestModel.find).toHaveBeenCalledWith({
        isActive: true,
      });
    });

    it("should use default values for limit and offset", async () => {
      const mockRequests = [
        {
          _id: "1",
          createAt: new Date(),
          isActive: true,
          hasNewMessages: false,
          user: {
            _id: "user1",
            name: "User One",
            email: "user1@example.com",
            contactPhone: "1234567890",
          },
        },
      ];

      mockSupportRequestModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRequests),
            }),
          }),
        }),
      });

      const result = await service.findAllForManager({});

      expect(result).toEqual(
        mockRequests.map((req) => ({
          id: req._id,
          createdAt: req.createAt,
          isActive: req.isActive,
          hasNewMessages: req.hasNewMessages,
          client: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            contactPhone: req.user.contactPhone,
          },
        })),
      );
      expect(mockSupportRequestModel.find).toHaveBeenCalledWith({
        isActive: true,
      });
    });

    it("should respect limit and offset from query", async () => {
      const mockRequests = [
        {
          _id: "1",
          createAt: new Date(),
          isActive: true,
          hasNewMessages: false,
          user: {
            _id: "user1",
            name: "User One",
            email: "user1@example.com",
            contactPhone: "1234567890",
          },
        },
      ];
      const query = { limit: 5, offset: 2, isActive: "true" };

      mockSupportRequestModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRequests),
            }),
          }),
        }),
      });

      const result = await service.findAllForManager(query);

      expect(result).toEqual(
        mockRequests.map((req) => ({
          id: req._id,
          createdAt: req.createAt,
          isActive: req.isActive,
          hasNewMessages: req.hasNewMessages,
          client: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            contactPhone: req.user.contactPhone,
          },
        })),
      );
      expect(mockSupportRequestModel.find).toHaveBeenCalledWith({
        isActive: true,
      });
    });
  });
});
