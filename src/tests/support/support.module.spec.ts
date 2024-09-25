import { Test, TestingModule } from '@nestjs/testing';
import { SupportModule } from '../../modules/support/support.module';
import { SupportRequestService } from '../../modules/support/services/support-request.service';
import { SupportController } from '../../modules/support/controllers/support.controller';
import { SupportRequestEmployeeService } from '../../modules/support/services/support-request-employee.service';
import { SupportRequestClientService } from '../../modules/support/services/support-request-client.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { SupportRequest } from '../../modules/support/models/support-request.model';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('SupportModule', () => {
    let module: TestingModule;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                SupportModule,
                EventEmitterModule.forRoot(),
            ],
        }).compile();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should be defined', () => {
        const supportRequestService = module.get<SupportRequestService>(SupportRequestService);
        const supportRequestEmployeeService = module.get<SupportRequestEmployeeService>(SupportRequestEmployeeService);
        const supportRequestClientService = module.get<SupportRequestClientService>(SupportRequestClientService);
        const supportController = module.get<SupportController>(SupportController);

        expect(supportRequestService).toBeDefined();
        expect(supportRequestEmployeeService).toBeDefined();
        expect(supportRequestClientService).toBeDefined();
        expect(supportController).toBeDefined();
    });

    it('should provide SupportRequest model', () => {
        const supportRequestModel = module.get(getModelToken(SupportRequest.name));
        expect(supportRequestModel).toBeDefined();
    });
});
