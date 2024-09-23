import { Test, TestingModule } from '@nestjs/testing';
import { SupportController } from '../../../../modules/support/controllers/support.controller';
import { SupportRequestClientService } from '../../../../modules/support/services/support-request-client.service';
import { SupportRequestService } from '../../../../modules/support/services/support-request.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../../../guards/roles-guard';

describe('SupportController', () => {
    let controller: SupportController;
    let supportRequestClientService: SupportRequestClientService;
    let supportRequestService: SupportRequestService;

    const mockSupportRequestClientService = {
        createSupportRequest: jest.fn(),
    };

    const mockSupportRequestService = {
        findAllByUser: jest.fn(),
        findAllForManager: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SupportController],
            providers: [
                {
                    provide: SupportRequestClientService,
                    useValue: mockSupportRequestClientService,
                },
                {
                    provide: SupportRequestService,
                    useValue: mockSupportRequestService,
                },
            ],
        })
        .overrideGuard(AuthGuard('session'))
        .useValue({ canActivate: jest.fn(() => true) })
        .overrideGuard(RoleGuard)
        .useValue({ canActivate: jest.fn(() => true) })
        .compile();

        controller = module.get<SupportController>(SupportController);
        supportRequestClientService = module.get<SupportRequestClientService>(SupportRequestClientService);
        supportRequestService = module.get<SupportRequestService>(SupportRequestService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createSupportRequest', () => {
        it('should create a support request', async () => {
            const userId = 'userId';
            const text = 'Test support request';
            const mockRequest = {
                _id: 'supportRequestId',
                createAt: new Date(),
                isActive: true,
                messages: [{ readAt: null }],
            };

            const req = { user: { id: userId } };

            mockSupportRequestClientService.createSupportRequest.mockResolvedValue(mockRequest);

            const result = await controller.createSupportRequest({ text }, req);

            expect(result).toEqual({
                id: mockRequest._id,
                createdAt: mockRequest.createAt,
                isActive: mockRequest.isActive,
                hasNewMessages: true,
            });
            expect(mockSupportRequestClientService.createSupportRequest).toHaveBeenCalledWith({
                user: userId,
                text,
            });
        });
    });

    describe('getSupportRequests', () => {
        it('should return support requests for user', async () => {
            const userId = 'userId';
            const query = { limit: 10, offset: 0 };
            const mockRequests = [{ id: '1' }, { id: '2' }];

            const req = { user: { id: userId } };

            mockSupportRequestService.findAllByUser.mockResolvedValue(mockRequests);

            const result = await controller.getSupportRequests(req, query);

            expect(result).toEqual(mockRequests);
            expect(mockSupportRequestService.findAllByUser).toHaveBeenCalledWith(userId, query);
        });
    });

    describe('getClientSupportRequests', () => {
        it('should return client support requests', async () => {
            const userId = 'userId';
            const limit = 10;
            const offset = 0;
            const isActive = true;
            const mockRequests = [{ id: '1' }, { id: '2' }];

            const req = { user: { id: userId } };

            mockSupportRequestService.findAllForManager.mockResolvedValue(mockRequests);

            const result = await controller.getClientSupportRequests(limit, offset, isActive, req);

            expect(result).toEqual(mockRequests);
            expect(mockSupportRequestService.findAllForManager).toHaveBeenCalledWith({ userId, limit, offset, isActive });
        });
    });
});
