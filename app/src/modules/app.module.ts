import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { HotelModule } from './hotel/hotel.module';
import { ReservationModule } from './reservation/reservation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportModule } from './support/support.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { resolve } from 'path';
import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: resolve(__dirname, '../../.env'),
        }),
        MongooseModule.forRoot(process.env.MONGO_URL),
        UsersModule, 
        HotelModule, 
        ReservationModule, 
        SupportModule, 
        AuthModule
    ],
    controllers: [AppController]
})
export class AppModule {};