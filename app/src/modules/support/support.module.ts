import { Module } from '@nestjs/common';
import { SupportRequestService } from './services/support-request.service';
import { SupportController } from './support.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportRequest, SupportRequestSchema } from './models/support-request.model';
import { SupportRequestEmployeeService } from './services/support-request-employee.service';
import { SupportRequestClientService } from './services/support-request-client.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SupportRequest.name, schema: SupportRequestSchema },
        ]),
        EventEmitterModule.forRoot(),
    ],
    providers: [SupportRequestService, SupportRequestEmployeeService, SupportRequestClientService],
    controllers: [SupportController],
    exports: [SupportRequestService, SupportRequestEmployeeService, SupportRequestClientService]
})
export class SupportModule {};
