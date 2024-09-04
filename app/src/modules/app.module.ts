import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { HotelModule } from './hotel/hotel.module';
import { ReservationModule } from './reservation/reservation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportModule } from './support/support.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost/nest'),
        UsersModule, 
        HotelModule, 
        ReservationModule, SupportModule
    ],
})
export class AppModule {};
