import { Module } from "@nestjs/common";
import { ReservationService } from "./services/reservation.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Reservation, ReservationSchema } from "./models/reservation.model";
import { Hotel, HotelSchema } from "../hotel/models/hotel.model";
import { HotelRoom, HotelRoomSchema } from "../hotel/models/hotel-room.model";
import { ReservationController } from "./controllers/reservation.controller";
import { ReservationManagerController } from "./controllers/reservation-manager.controller";
import { ReservationManagerService } from "./services/reservation-manager.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema },
      { name: Hotel.name, schema: HotelSchema },
    ]),
  ],
  controllers: [ReservationController, ReservationManagerController],
  providers: [ReservationService, ReservationManagerService],
  exports: [ReservationService, ReservationManagerService],
})
export class ReservationModule {}
