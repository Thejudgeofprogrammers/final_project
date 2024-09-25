import { Test, TestingModule } from '@nestjs/testing';
import { SupportRequestEmployeeService } from '../../../modules/support/services/support-request-employee.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MarkMessagesAsReadDTO } from '../../../modules/support/dto';
import { mock } from 'jest-mock-extended';
import { SupportRequestDocument } from '../../../modules/support/models/support-request.model';

describe('SupportRequestEmployeeService', () => {
    let service: SupportRequestEmployeeService;
    const supportRequestModelMock = mock<Model<SupportRequestDocument>>();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SupportRequestEmployeeService,
                {
                    provide: getModelToken('SupportRequest'),
                    useValue: supportRequestModelMock,
                },
            ],
        }).compile();

        service = module.get<SupportRequestEmployeeService>(SupportRequestEmployeeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('markMessagesAsRead', () => {
        it('should mark messages as read', async () => {
            const params: MarkMessagesAsReadDTO = {
                supportRequest: new Types.ObjectId().toString(),
                user: new Types.ObjectId(),
                createdBefore: new Date(),
            };

            const supportRequestMock = {
                messages: [
                    {
                        author: params.user,
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

            jest.spyOn(supportRequestModelMock, 'findById').mockResolvedValue(supportRequestMock as any);

            await service.markMessagesAsRead(params);

            expect(supportRequestMock.messages[0].readAt).not.toBeNull();
            expect(supportRequestMock.messages[1].readAt).toBeNull();
            expect(supportRequestMock.save).toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            const params = { supportRequest: 'invalidId', user: 'user123', createdBefore: new Date() };
            supportRequestModelMock.findById.mockRejectedValue(new Error('Database error'));

            await expect(service.markMessagesAsRead(params)).rejects.toThrow('Database error');
        });
    });

    describe('getUnreadCount', () => {
        it('should return the number of unread messages', async () => {
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

            jest.spyOn(supportRequestModelMock, 'findById').mockResolvedValue(supportRequestMock as any);

            const unreadCount = await service.getUnreadCount(supportRequestId);

            expect(unreadCount).toEqual(1);
        });

        it('should handle errors gracefully', async () => {
            supportRequestModelMock.findById.mockRejectedValue(new Error('Database error'));

            await expect(service.getUnreadCount('invalidId')).rejects.toThrow('Database error');
        });
    });

    describe('closeRequest', () => {
        it('should close the support request', async () => {
            const supportRequestId = new Types.ObjectId().toString();

            jest.spyOn(supportRequestModelMock, 'findByIdAndUpdate').mockResolvedValue(true);

            await service.closeRequest(supportRequestId);

            expect(supportRequestModelMock.findByIdAndUpdate).toHaveBeenCalledWith(supportRequestId, { isActive: false });
        });

        it('should handle errors gracefully', async () => {
            supportRequestModelMock.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

            await expect(service.closeRequest('invalidId')).rejects.toThrow('Database error');
        });
    });
});
