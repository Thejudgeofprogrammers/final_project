import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './models/reservation.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }])
    ],
    providers: [ReservationService],
    controllers: [ReservationController],
    exports: [ReservationService]
})
export class ReservationModule {};
