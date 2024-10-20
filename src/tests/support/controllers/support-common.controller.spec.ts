import { Test, TestingModule } from "@nestjs/testing";
import { CommonController } from "../../../modules/support/controllers/support-common.controller";
import { SupportRequestService } from "../../../modules/support/services/support-request.service";
import { SupportRequestEmployeeService } from "../../../modules/support/services/support-request-employee.service";
import { SendMessageDTO } from "../../../modules/support/dto";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "../../../guards/roles-guard";

describe("CommonController", () => {
  let controller: CommonController;
  let supportRequestService: SupportRequestService;
  let supportRequestEmployeeService: SupportRequestEmployeeService;

  const mockSupportRequestService = {
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
  };

  const mockSupportRequestEmployeeService = {
    markMessagesAsRead: jest.fn(),
  };

  const mockUser = { id: "user-id" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommonController],
      providers: [
        {
          provide: SupportRequestService,
          useValue: mockSupportRequestService,
        },
        {
          provide: SupportRequestEmployeeService,
          useValue: mockSupportRequestEmployeeService,
        },
      ],
    })
      .overrideGuard(AuthGuard("session"))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CommonController>(CommonController);
    supportRequestService = module.get<SupportRequestService>(
      SupportRequestService,
    );
    supportRequestEmployeeService = module.get<SupportRequestEmployeeService>(
      SupportRequestEmployeeService,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getSupportRequestMessages", () => {
    it("should return messages for a support request", async () => {
      const supportRequestId = "support-request-id";
      const result = [{ id: 1, text: "Test message" }];
      mockSupportRequestService.getMessages.mockResolvedValue(result);

      const messages =
        await controller.getSupportRequestMessages(supportRequestId);

      expect(messages).toEqual(result);
      expect(mockSupportRequestService.getMessages).toHaveBeenCalledWith(
        supportRequestId,
      );
    });
  });

  describe("sendSupportRequestMessage", () => {
    it("should send a message for a support request", async () => {
      const supportRequestId = "support-request-id";
      const createMessageDto: SendMessageDTO = {
        author: mockUser.id,
        supportRequest: supportRequestId,
        text: "New message",
      };
      const result = { id: 1, text: "New message" };
      mockSupportRequestService.sendMessage.mockResolvedValue(result);

      const response = await controller.sendSupportRequestMessage(
        supportRequestId,
        createMessageDto,
        { user: mockUser },
      );

      expect(response).toEqual(result);
      expect(mockSupportRequestService.sendMessage).toHaveBeenCalledWith({
        supportRequest: supportRequestId,
        text: createMessageDto.text,
        author: mockUser.id,
      });
    });
  });

  describe("markMessagesAsRead", () => {
    it("should mark messages as read", async () => {
      const supportRequestId = "support-request-id";
      const createdBefore = "2024-09-20T00:00:00Z";
      const userId = mockUser.id;

      await controller.markMessagesAsRead(
        supportRequestId,
        { createdBefore },
        { user: mockUser },
      );

      expect(
        mockSupportRequestEmployeeService.markMessagesAsRead,
      ).toHaveBeenCalledWith({
        supportRequest: supportRequestId,
        user: userId,
        createdBefore: new Date(createdBefore),
      });
    });
  });
});
