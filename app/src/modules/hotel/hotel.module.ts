import { Module } from '@nestjs/common';
import { HotelService } from './services/hotel.service';
import { HotelController } from './hotel.controller';
import { HotelRoomService } from './services/hotel-room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from './models/hotel.model';
import { HotelRoom, HotelRoomSchema } from './models/hotel-room.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Hotel.name, schema: HotelSchema },
            { name: HotelRoom.name, schema: HotelRoomSchema}
        ])
    ],
    providers: [HotelService, HotelRoomService],
    controllers: [HotelController],
    exports: [HotelService, HotelRoomService]
})
export class HotelModule {};
