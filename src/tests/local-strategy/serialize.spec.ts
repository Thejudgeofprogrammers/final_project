import { Test, TestingModule } from '@nestjs/testing';
import { SessionSerializer } from '../../local.strategy/session.serializer';

describe('SessionSerializer', () => {
    let sessionSerializer: SessionSerializer;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SessionSerializer],
        }).compile();

        sessionSerializer = module.get<SessionSerializer>(SessionSerializer);
    });

    describe('serializeUser', () => {
        it('should serialize the user correctly', (done) => {
            const user = { id: 1, email: 'test@example.com' };
            sessionSerializer.serializeUser(user, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual(user);
                done();
            });
        });
    });

    describe('deserializeUser', () => {
        it('should deserialize the user correctly', (done) => {
            const payload = { id: 1, email: 'test@example.com' };
            sessionSerializer.deserializeUser(payload, (err, result) => {
                expect(err).toBeNull();
                expect(result).toEqual(payload);
                done();
            });
        });
    });
});
