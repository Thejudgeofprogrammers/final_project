import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { IHotelParams, IHotelRoom, SearchRoomsParams } from './dto';
import { HotelRoomService } from './services/hotel-room.service';
import { Types } from 'mongoose';

@Controller('api/common/hotel-room')
export class HotelController {
    constructor(
        private readonly hotelRoomService: HotelRoomService
    ) {};

    @Get()
    async searchHotelRooms(
        @Query('limit') limit: number,
        @Query('offset') offset: number,
        @Query('hotel') hotel: string
    ) {
        const params: SearchRoomsParams= {
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            hotel: hotel ? new Types.ObjectId(hotel) : null,
            isEnable: true,
        };

        const rooms = await this.hotelRoomService.search(params);
        
        return rooms.map((room) => ({
            id: (room as IHotelRoom)._id.toString(),
            description: room.description,
            image: room.image,
            hotel: {
                id: room.hotel instanceof Types.ObjectId ? room.hotel.toString() : (room.hotel as any)._id.toString(),
                title: (room.hotel as any).title,
            },
        }));
    };

    @Get(':id')
    async searchHotelRoomById(
        @Param(':id') id: string
    ) {
        const room = await this.hotelRoomService.findById(id);

        if (!room) {
            throw new NotFoundException('Hotel room not found');
        };
      
        return {
            id: (room as IHotelRoom)._id.toString(),
            description: room.description,
            image: room.image,
            hotel: {
                id: room.hotel instanceof Types.ObjectId ? room.hotel.toString() : (room.hotel as any)._id.toString(),
                title: (room.hotel as any).title,
                description: (room.hotel as any).description,
            },
        };
    };
};
