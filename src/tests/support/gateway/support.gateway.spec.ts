import { Test, TestingModule } from '@nestjs/testing';
import { SupportChatGateway } from '../../../modules/support/gateway/support.gateway';
import { Socket } from 'socket.io';

describe('SupportChatGateway', () => {
    let gateway: SupportChatGateway;
    let server: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SupportChatGateway],
        }).compile();

        gateway = module.get<SupportChatGateway>(SupportChatGateway);
        server = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };
        gateway.server = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleSubscribeToChat', () => {
        it('should subscribe a client to a chat', () => {
            const mockClient = {
                join: jest.fn(),
            } as unknown as Socket;

            const chatId = 'testChatId';
            const response = gateway.handleSubscribeToChat(chatId, mockClient);

            expect(mockClient.join).toHaveBeenCalledWith(chatId);
            expect(response).toEqual({ event: 'subscribed', chatId });
        });
    });

    describe('sendMessageToChat', () => {
        it('should emit a new message to the specified chat', () => {
            const chatId = 'testChatId';
            const message = { text: 'Hello, World!' };

            gateway.sendMessageToChat(chatId, message);

            expect(server.to).toHaveBeenCalledWith(chatId);
            expect(server.emit).toHaveBeenCalledWith('newMessage', message);
        });
    });
});
