// import { Controller, Get, Post, Put, Query } from '@nestjs/common';
// import { HotelService } from './services/hotel.service';
// import { HotelRoomService } from './services/hotel-room.service';
// import { SearchRoomsParams } from './dto';
// import { ObjectId, Types } from 'mongoose';

// @Controller('api/common')
// export class HotelController {
//     constructor(
//         private readonly hotelService: HotelService,
//         private readonly hotelRoomService: HotelRoomService
//     ) {};

//     @Get('')
//     async searchRooms(params: SearchRoomsParams) {
//         try {
//             return this.hotelRoomService.search();
//         } catch (err) {
            
//         };
//     };

//     @Get('')
//     async search(params: SearchRoomsParams) {
//         try {
//             return this.hotelService.search();
//         } catch (err) {
            
//         };
//     };

//     @Get('')
//     async findById(@Query('id') id: string | Types.ObjectId) {
//         try {
//             return this.hotelService.findById(id);
//         } catch (err) {

//         };
//     };

//     async findByIdRoom(@Query('id') id: string | Types.ObjectId) {
//         try {
//             return this.hotelRoomService.findById(id);  
//         } catch (err) {
            
//         };
//     };

//     @Post('')
//     async createHotelRoom() {
//         try {
//             return this.hotelRoomService.create();
//         } catch (err) {
            
//         };
//     };

//     @Post('')
//     async createHotel() {
//         try {
//             return this.hotelService.create();
//         } catch (err) {
            
//         };
//     };

//     @Put('')
//     async updateHotelRoom(+) {
//         try {
//             return this.hotelRoomService.update();
//         } catch (err) {
            
//         };
//     };

//     @Put('')
//     async updateHotel() {
//         try {
//             return this.hotelService.update();
//         } catch (err) {
            
//         };
//     };

// };
