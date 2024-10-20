import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ReservationService } from "../services/reservation.service";
import { Roles } from "../../../decorators/roles.decorator";
import { ReservationDTO, ReservationResponse } from "../dto";
import { Types } from "mongoose";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "../../../guards/roles-guard";
import { HotelRoom } from "../../../modules/hotel/models/hotel-room.model";
import { Hotel } from "../../../modules/hotel/models/hotel.model";

@UseGuards(AuthGuard("session"), RoleGuard)
@Controller("client/reservations")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Roles("client")
  @Post()
  async addReservation(
    @Body() data: ReservationDTO,
    @Req() req,
  ): Promise<ReservationResponse> {
    const userId = req.user._id;
    const reservation = await this.reservationService.addReservation({
      dateStart: new Date(data.dateStart),
      dateEnd: new Date(data.dateEnd),
      userId,
      hotelId: data.hotelId,
      roomId: data.roomId,
    });

    return {
      dateStart: reservation.dateStart,
      dateEnd: reservation.dateEnd,
      hotelRoom: {
        description: (reservation.roomId as HotelRoom).description,
        images: (reservation.roomId as HotelRoom).images,
      },
      hotel: {
        title: (reservation.hotelId as Hotel).title,
        description: (reservation.hotelId as Hotel).description,
      },
    };
  }

  @Roles("client")
  @Delete(":id")
  async removeReservation(
    id: Types.ObjectId | string,
    @Req() req,
  ): Promise<void> {
    const userId = req.user._id;
    await this.reservationService.removeReservation(id, userId);
  }

  @Roles("client")
  @Get()
  async getReservations(
    @Query() data: ReservationDTO,
    @Req() req,
  ): Promise<Array<ReservationResponse>> {
    const userId = req.user._id;
    const currentDate = new Date();
    const reservations = await this.reservationService.getReservations({
      userId,
      dateStart: data.dateStart ? new Date(data.dateStart) : currentDate,
      dateEnd: data.dateEnd ? new Date(data.dateEnd) : currentDate,
    });

    return reservations.map((reservation) => ({
      dateStart: reservation.dateStart,
      dateEnd: reservation.dateEnd,
      hotelRoom: {
        description: (reservation.roomId as HotelRoom).description,
        images: (reservation.roomId as HotelRoom).images,
      },
      hotel: {
        title: (reservation.hotelId as Hotel).title,
        description: (reservation.hotelId as Hotel).description,
      },
    }));
  }
}
