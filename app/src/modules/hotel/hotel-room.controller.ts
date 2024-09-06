import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { HotelService } from './services/hotel.service';
import { IHotelParams } from './dto';
import { RolesGuard } from '../../guards/admin-guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('api/admin')
@UseGuards(RolesGuard)
export class HotelRoomController {
    constructor(
        private readonly hotelService: HotelService
    ) {};

    @Roles('admin')
    @Post('hotels')
    async createHotel(@Body() hotelParams: IHotelParams) {
        const hotel = await this.hotelService.create(hotelParams);

        return {
            id: hotel._id.toString(),
            title: hotel.title,
            description: hotel.description,
        };
    };
    
    // @Get('hotels')
    

    // @Get('hotels/:id')

    // @Post('hotel-rooms')

    // @Put('hotel-rooms/:id')
};
