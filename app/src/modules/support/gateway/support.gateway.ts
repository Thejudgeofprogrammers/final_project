import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class SupportChatGateway {
    @WebSocketServer() server: Server;

    @SubscribeMessage('subscribeToChat')
    handleSubscribeToChat(
      @MessageBody() chatId: string,
      @ConnectedSocket() client: Socket
    ) {
        client.join(chatId);
        return { event: 'subscribed', chatId };
    };

    sendMessageToChat(chatId: string, message: any) {
        this.server.to(chatId).emit('newMessage', message);
    };
};