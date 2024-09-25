import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { HotelService } from '../services/hotel.service';
import { HotelWithId, IHotelParams, IHotelRoom, UpdateHotelParams } from '../dto';
import { Roles } from '../../../decorators/roles.decorator';
import { Types } from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { HotelRoomService } from '../services/hotel-room.service';
import { multerConfig } from '../../../config/multer.config';
import { RoleGuard } from '../../../guards/roles-guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/admin')
@UseGuards(AuthGuard('session'), RoleGuard)
export class HotelRoomController {
    constructor(
        private readonly hotelService: HotelService,
        private readonly hotelRoomService: HotelRoomService
    ) {};

    @Roles('admin')
    @Post('hotels')
    async createHotel(@Body() hotelParams: IHotelParams) {
        if (!Types.ObjectId.isValid(hotelParams._id)) throw new NotFoundException('Invalid hotel ID');
        const hotel = await this.hotelService.create(hotelParams);

        return {
            id: hotel._id.toString(),
            title: hotel.title,
            description: hotel.description,
        };
    };

    @Roles('admin')
    @Get('hotels')
    async getHotels(
        @Query('limit', ParseIntPipe) limit: number = 10,
        @Query('offset', ParseIntPipe) offset: number = 0,
        @Query('title') title: string = ''
    ) {
        const hotels = await this.hotelService.search({
            limit: isNaN(limit) ? 10 : limit,
            offset: isNaN(offset) ? 0 : offset,
            title: title || '',
        });
    
        return hotels.map((hotel: HotelWithId) => ({
            id: hotel._id.toString(),
            title: hotel.title,
            description: hotel.description,
        }));
    };

    @Roles('admin')
    @Put('hotel-rooms/:id')
    async updateHotelDescription(
        @Param('id') id: string,
        @Body() updateHotelDTO: UpdateHotelParams
    ) {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid hotel ID');
        const updatedHotel = await this.hotelService.update(id, updateHotelDTO);
        if (!updatedHotel) throw new NotFoundException('Hotel not found');

        return {
            id: (updatedHotel as HotelWithId)._id.toString(),
            title: updatedHotel.title,
            description: updatedHotel.description
        };
    };


    @Roles('admin')
    @Post('hotel-rooms')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'images', maxCount: 10}
    ], multerConfig))
    async addHotelRoom(
        @Body() createHotelDTO: IHotelRoom,
        @UploadedFiles() files: { images?: Express.Multer.File[] }
    ) {
        if (!files.images || files.images.length === 0) throw new ForbiddenException('Images are required');
        const imagePaths = files.images.map(file => file.filename);

        const hotelRoom = await this.hotelRoomService.create({
            description: createHotelDTO.description,
            hotel: new Types.ObjectId(createHotelDTO.hotel._id),
            images: imagePaths,
            isEnable: true
        });

        return {
            id: (hotelRoom as IHotelRoom)._id.toString(),
            description: hotelRoom.description,
            images: hotelRoom.images,
            isEnable: hotelRoom.isEnable,
            hotel: {
                id: hotelRoom.hotel._id.toString(),
                title: (hotelRoom.hotel as any).title,
                description: (hotelRoom.hotel as any).description,
            }
        };
    };
};
