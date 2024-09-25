import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from '../../../modules/reservation/controllers/reservation.controller';
import { ReservationService } from '../../../modules/reservation/services/reservation.service';
import { ReservationDTO } from '../../../modules/reservation/dto';
import { Types } from 'mongoose';

describe('ReservationController', () => {
    let controller: ReservationController;
    let service: ReservationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReservationController],
            providers: [
                {
                    provide: ReservationService,
                    useValue: {
                        addReservation: jest.fn(),
                        removeReservation: jest.fn(),
                        getReservations: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ReservationController>(ReservationController);
        service = module.get<ReservationService>(ReservationService);
    });

    describe('addReservation', () => {
        it('should add a reservation and return it', async () => {
            const reservationDTO: ReservationDTO = {
                dateStart: new Date(),
                dateEnd: new Date(),
                roomId: new Types.ObjectId(),
                hotelId: new Types.ObjectId(),
                userId: new Types.ObjectId(),
            };

            const mockReservation: any = {
                ...reservationDTO,
                roomId: { description: 'Room desc', images: ['image.jpg'] },
                hotelId: { title: 'Hotel title', description: 'Hotel desc' },
            };

            jest.spyOn(service, 'addReservation').mockResolvedValue(mockReservation);

            const result = await controller.addReservation(reservationDTO, { user: { _id: reservationDTO.userId } });

            expect(result).toEqual({
                dateStart: reservationDTO.dateStart,
                dateEnd: reservationDTO.dateEnd,
                hotelRoom: {
                    description: mockReservation.roomId.description,
                    images: mockReservation.roomId.images,
                },
                hotel: {
                    title: mockReservation.hotelId.title,
                    description: mockReservation.hotelId.description,
                },
            });
        });
    });

    describe('removeReservation', () => {
        it('should remove a reservation', async () => {
            const reservationId = new Types.ObjectId();
            const userId = new Types.ObjectId();

            jest.spyOn(service, 'removeReservation').mockResolvedValue(undefined);

            await expect(controller.removeReservation(reservationId, { user: { _id: userId } })).resolves.not.toThrow();
            expect(service.removeReservation).toHaveBeenCalledWith(reservationId, userId);
        });
    });

    describe('getReservations', () => {
        it('should return an array of reservations', async () => {
            const userId = new Types.ObjectId();
            const mockReservations = [
                {
                    dateStart: new Date(),
                    dateEnd: new Date(),
                    roomId: {
                        _id: new Types.ObjectId(),
                        description: 'Room desc',
                        images: ['image.jpg'],
                    },
                    hotelId: {
                        _id: new Types.ObjectId(),
                        title: 'Hotel title',
                        description: 'Hotel desc',
                    },
                    userId: userId,
                },
            ];

            jest.spyOn(service, 'getReservations').mockResolvedValue(mockReservations as any);

            const result = await controller.getReservations({ user: { _id: userId } });

            expect(result).toEqual(mockReservations.map((reservation) => ({
                dateStart: reservation.dateStart,
                dateEnd: reservation.dateEnd,
                hotelRoom: {
                    description: reservation.roomId.description,
                    images: reservation.roomId.images,
                },
                hotel: {
                    title: reservation.hotelId.title,
                    description: reservation.hotelId.description,
                },
            })));
        });
    });
});
