import { Controller } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from './models/reservation.model';
import { ReservationDTO, ReservationSearchOptions } from './dto';
import { ObjectId } from 'mongoose';

@Controller('reservation')
export class ReservationController {
    constructor(
        private readonly reservationService: ReservationService
    ) {};

    async addReservation(data: ReservationDTO): Promise<Reservation> {
        return this.reservationService.addReservation(data);
    };

    async removeReservation(id: ObjectId | string): Promise<void> {
        return this.reservationService.removeReservation(id);
    };

    async getReservations(
      filter: ReservationSearchOptions
    ): Promise<Array<Reservation>> {
        return this.reservationService.getReservations(filter);
    };
};
