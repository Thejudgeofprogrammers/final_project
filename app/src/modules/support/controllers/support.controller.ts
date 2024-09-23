import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../decorators/roles.decorator';
import { RoleGuard } from '../../../guards/roles-guard';
import { CreateSupportRequestDTO } from '../dto';
import { SupportRequestClientService } from '../services/support-request-client.service';
import { SupportRequestService } from '../services/support-request.service';

@Controller('api/client/support-requests')
export class SupportController {
    constructor(
        private readonly supportRequestClientService: SupportRequestClientService,
        private readonly supportRequestService: SupportRequestService
    ) { };

    @UseGuards(AuthGuard('session'), RoleGuard)
    @Roles('client')
    @Post()
    async createSupportRequest(@Body() body: { text: string }, @Req() req) {
        const dto: CreateSupportRequestDTO = {
            user: req.user.id,
            text: body.text,
        };

        const supportRequest = await this.supportRequestClientService.createSupportRequest(dto);

        return {
            id: (supportRequest as any)._id,
            createdAt: supportRequest.createAt,
            isActive: supportRequest.isActive,
            hasNewMessages: supportRequest.messages.some(m => !m.readAt),
        };
    };

    @UseGuards(AuthGuard('session'), RoleGuard)
    @Roles('client')
    @Get()
    async getSupportRequests(@Req() req, @Query() query: any) {
        const userId = req.user.id;
        return this.supportRequestService.findAllByUser(userId, query);
    };

    @Get('support-requests')
    @UseGuards(AuthGuard('session'), RoleGuard)
    @Roles('client')
    async getClientSupportRequests(
        @Query('limit') limit: number,
        @Query('offset') offset: number,
        @Query('isActive') isActive: boolean,
        @Req() req
    ) {
        const userId = req.user.id;
        return this.supportRequestService.findAllForManager({ userId, limit, offset, isActive });
    };
};