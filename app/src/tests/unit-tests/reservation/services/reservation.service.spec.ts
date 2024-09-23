import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from '../../../../modules/reservation/services/reservation.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query, Types } from 'mongoose';
import { Reservation, ReservationDocument } from '../../../../modules/reservation/models/reservation.model';
import { BadRequestException } from '@nestjs/common';
import { ReservationDTO, ReservationSearchOptions } from '../../../../modules/reservation/dto';

describe('ReservationService', () => {
    let service: ReservationService;
    let model: Model<ReservationDocument>;

    const mockQuery = {
        exec: jest.fn(),
    } as unknown as Query<ReservationDocument[], ReservationDocument>;

    const mockReservationModel = {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndDelete: jest.fn(),
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReservationService,
                {
                    provide: getModelToken(Reservation.name),
                    useValue: mockReservationModel,
                },
            ],
        }).compile();

        service = module.get<ReservationService>(ReservationService);
        model = module.get<Model<ReservationDocument>>(getModelToken(Reservation.name));
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReservationService,
                {
                    provide: getModelToken(Reservation.name),
                    useValue: {
                        find: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndDelete: jest.fn(),
                        save: jest.fn(),
                        populate: jest.fn(),
                        create: jest.fn()
                    }  as unknown as Model<ReservationDocument>,
                },
            ],
        }).compile();

        service = module.get<ReservationService>(ReservationService);
        model = module.get<Model<ReservationDocument>>(getModelToken(Reservation.name));
    });
    
    describe('addReservation', () => {
        it('should add a reservation and return it', async () => {
            const dto: ReservationDTO = {
                dateStart: new Date(),
                dateEnd: new Date(),
                roomId: new Types.ObjectId(),
                hotelId: new Types.ObjectId(),
                userId: new Types.ObjectId(),
            };
    
            const savedReservation: ReservationDocument = {
                _id: new Types.ObjectId(),
                ...dto,
                __v: 0,
            } as any;
    
            const populatedReservation = {
                ...savedReservation,
                roomId: { description: 'Room desc', images: ['image.jpg'] } as any,
                hotelId: { title: 'Hotel title', description: 'Hotel desc' } as any,
            } as any;
    
            const query = {
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(populatedReservation),
            } as any;
    
            jest.spyOn(model, 'find').mockResolvedValue([] as any);
            jest.spyOn(model, 'create').mockResolvedValue(savedReservation as any);
            jest.spyOn(model, 'findById').mockReturnValue(query);
    
            const result = await service.addReservation(dto);
    
            expect(result).toEqual(populatedReservation);
        });
    
        it('should throw BadRequestException if room is already booked', async () => {
            const dto: ReservationDTO = {
                dateStart: new Date(),
                dateEnd: new Date(),
                roomId: new Types.ObjectId(),
                hotelId: new Types.ObjectId(),
                userId: new Types.ObjectId(),
            };
    
            jest.spyOn(model, 'find').mockResolvedValue([{ _id: new Types.ObjectId() }] as any);
    
            await expect(service.addReservation(dto)).rejects.toThrow(BadRequestException);
        });
    
        it('should handle errors thrown during reservation', async () => {
            const dto: ReservationDTO = {
                dateStart: new Date(),
                dateEnd: new Date(),
                roomId: new Types.ObjectId(),
                hotelId: new Types.ObjectId(),
                userId: new Types.ObjectId(),
            };
    
            jest.spyOn(model, 'find').mockResolvedValue([] as any);
            jest.spyOn(model, 'create').mockRejectedValue(new Error('Database error'));
    
            await expect(service.addReservation(dto)).rejects.toThrow('Database error');
        });
    });    

    describe('removeReservation', () => {
        it('should remove a reservation if it exists and user is authorized', async () => {
            const id = new Types.ObjectId();
            const userId = new Types.ObjectId();

            const reservation = {
                _id: id,
                userId,
            };

            jest.spyOn(model, 'findById').mockResolvedValue(reservation as any);
            jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(reservation as any);

            await service.removeReservation(id, userId);

            expect(model.findByIdAndDelete).toHaveBeenCalledWith(id);
        });

        it('should throw BadRequestException if reservation does not exist', async () => {
            const id = new Types.ObjectId();
            const userId = new Types.ObjectId();

            jest.spyOn(model, 'findById').mockResolvedValue(null);

            await expect(service.removeReservation(id, userId)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if user is not authorized', async () => {
            const id = new Types.ObjectId();
            const userId = new Types.ObjectId();

            const reservation = {
                _id: id,
                userId: new Types.ObjectId(),
            };

            jest.spyOn(model, 'findById').mockResolvedValue(reservation as any);

            await expect(service.removeReservation(id, userId)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getReservations', () => {
        it('should return an array of reservations', async () => {
            const userId = new Types.ObjectId();
            const filter: ReservationSearchOptions = {
                userId,
                dateStart: new Date(),
                dateEnd: new Date(),
            };
    
            const reservations = [
                {
                    dateStart: new Date(),
                    dateEnd: new Date(),
                    roomId: new Types.ObjectId(),
                    hotelId: new Types.ObjectId(),
                    userId,
                },
            ];
    
            const query = {
                exec: jest.fn().mockResolvedValue(reservations),
            } as any;
    
            jest.spyOn(model, 'find').mockReturnValue(query);
    
            const result = await service.getReservations(filter);
    
            expect(result).toEqual(reservations);
        });

        it('should throw an error if the database query fails', async () => {
            const userId = new Types.ObjectId();
            const filter: ReservationSearchOptions = {
                userId,
                dateStart: new Date(),
                dateEnd: new Date(),
            };
    
            const mockQuery = {
                exec: jest.fn().mockRejectedValue(new Error('Database error')),
            } as unknown as Query<ReservationDocument[], ReservationDocument>;
    
            jest.spyOn(model, 'find').mockReturnValue(mockQuery);
    
            await expect(service.getReservations(filter)).rejects.toThrow('Database error');
        });
    });
});
