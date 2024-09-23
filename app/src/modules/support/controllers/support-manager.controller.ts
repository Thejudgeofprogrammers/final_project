import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../../../decorators/roles.decorator";
import { RoleGuard } from "../../../guards/roles-guard";
import { SupportRequestService } from "../services/support-request.service";

@Controller('api/manager/support-requests')
export class ManagerController {
    constructor (
        private readonly supportRequestService: SupportRequestService
    ) {};
    
    @Get('/manager/support-requests')
    @UseGuards(AuthGuard('session'), RoleGuard)
    @Roles('manager')
    async getManagerSupportRequests(
        @Query('limit') limit: number,
        @Query('offset') offset: number,
        @Query('isActive') isActive: boolean
    ) {
        return this.supportRequestService.findAllForManager({ limit, offset, isActive });
    };
};
