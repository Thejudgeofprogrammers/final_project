import { Test, TestingModule } from '@nestjs/testing';
import { ManagerController } from '../../../../modules/support/controllers/support-manager.controller';
import { SupportRequestService } from '../../../../modules/support/services/support-request.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../../../guards/roles-guard';

describe('ManagerController', () => {
    let controller: ManagerController;
    let supportRequestService: SupportRequestService;

    const mockSupportRequestService = {
        findAllForManager: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ManagerController],
            providers: [
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

        controller = module.get<ManagerController>(ManagerController);
        supportRequestService = module.get<SupportRequestService>(SupportRequestService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getManagerSupportRequests', () => {
        it('should return support requests for manager', async () => {
            const limit = 10;
            const offset = 0;
            const isActive = true;
            const result = [{ id: 1, text: 'Test request' }];
            
            mockSupportRequestService.findAllForManager.mockResolvedValue(result);

            const response = await controller.getManagerSupportRequests(limit, offset, isActive);

            expect(response).toEqual(result);
            expect(mockSupportRequestService.findAllForManager).toHaveBeenCalledWith({ limit, offset, isActive });
        });
    });
});
