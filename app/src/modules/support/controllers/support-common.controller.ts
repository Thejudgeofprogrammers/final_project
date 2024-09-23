import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../../../decorators/roles.decorator";
import { RoleGuard } from "../../../guards/roles-guard";
import { SupportRequestService } from "../services/support-request.service";
import { SendMessageDTO } from "../dto";
import { SupportRequestEmployeeService } from "../services/support-request-employee.service";

@Controller('api/common/support-requests')
export class CommonController {
    constructor(
        private readonly supportRequestsService: SupportRequestService,
        private readonly supportRequestEmployeeService: SupportRequestEmployeeService
      ) {};
    
    @Get(':id/messages')
    @UseGuards(AuthGuard('session'), RoleGuard)
    @Roles('client', 'manager')
    async getSupportRequestMessages(
        @Param('id') supportRequestId: string,
    ) {
        return this.supportRequestsService.getMessages(supportRequestId);
    };
    
    @Post(':id/messages')
    @UseGuards(AuthGuard('session'), RoleGuard)
    @Roles('client', 'manager')
    async sendSupportRequestMessage(
        @Param('id') supportRequestId: string,
        @Body() createMessageDto: SendMessageDTO,
        @Req() req
    ) {
        const userId = req.user.id;
        return this.supportRequestsService.sendMessage({
            supportRequest: supportRequestId,
            text: createMessageDto.text,
            author: userId
        });
    };
    
    @Post(':id/messages/read')
    @UseGuards(AuthGuard('session'), RoleGuard)
    @Roles('client', 'manager')
    async markMessagesAsRead(
        @Param('id') supportRequestId: string,
        @Body() { createdBefore }: { createdBefore: string },
        @Req() req
    ) {
        const userId = req.user.id;
        return this.supportRequestEmployeeService.markMessagesAsRead({
            supportRequest: supportRequestId,
            user: userId,
            createdBefore: new Date(createdBefore),
        });
    };
};
