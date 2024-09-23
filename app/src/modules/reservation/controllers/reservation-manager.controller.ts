import { Controller, Delete, Get, Param, UseGuards } from "@nestjs/common";
import { ReservationManagerService } from "../services/reservation-manager.service";
import { Roles } from "../../../decorators/roles.decorator";
import { ReservationResponse } from "../dto";
import { Types } from "mongoose";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "../../../guards/roles-guard";
import { HotelRoom } from "../../../modules/hotel/models/hotel-room.model";
import { Hotel } from "../../../modules/hotel/models/hotel.model";

@UseGuards(AuthGuard('session'), RoleGuard)
@Controller('/api/manager/reservations')
export class ReservationManagerController {
    constructor(
        private readonly reservationManagerService: ReservationManagerService
    ) {};

    @Roles('manager')
    @Get(':userId')
    async getReservationsByUser(
        @Param('userId') userId: Types.ObjectId
    ): Promise<ReservationResponse[]> {
        const reservations = await this.reservationManagerService.getReservationsByUser(userId);
        
        return reservations.map((reservation) => ({
            dateStart: reservation.dateStart,
            dateEnd: reservation.dateEnd,
            hotelRoom: {
                description: (reservation.roomId as HotelRoom).description,
                images: (reservation.roomId as HotelRoom).images
            },
            hotel: {
                title: (reservation.hotelId as Hotel).title,
                description: (reservation.hotelId as Hotel).description
            }
        }));
    };

    @Roles('manager')
    @Delete(':id')
    async removeReservationByManager(@Param('id') id: string): Promise<void> {
        await this.reservationManagerService.removeReservationByManager(id);
    };
};