import { Test, TestingModule } from '@nestjs/testing';
import { HotelRoomController } from '../../../modules/hotel/controllers/hotel-room.controller';
import { HotelService } from '../../../modules/hotel/services/hotel.service';
import { HotelRoomService } from '../../../modules/hotel/services/hotel-room.service';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { IHotelRoom } from '../../../modules/hotel/dto';

describe('HotelRoomController', () => {
    let controller: HotelRoomController;
    let hotelService: HotelService;
    let hotelRoomService: HotelRoomService;

    const mockHotel = {
        _id: new Types.ObjectId(),
        title: 'Test Hotel',
        description: 'Test description',
    };

    const mockHotelRoom = {
        _id: new Types.ObjectId(),
        hotel: mockHotel,
        description: 'Room description',
        images: ['image1.jpg'],
        isEnable: true,
    };

    const mockHotelService = {
        create: jest.fn(),
        search: jest.fn(),
        update: jest.fn(),
    };

    const mockHotelRoomService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        controllers: [HotelRoomController],
        providers: [
            { provide: HotelService, useValue: mockHotelService },
            { provide: HotelRoomService, useValue: mockHotelRoomService },
        ],
        }).compile();

        controller = module.get<HotelRoomController>(HotelRoomController);
        hotelService = module.get<HotelService>(HotelService);
        hotelRoomService = module.get<HotelRoomService>(HotelRoomService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createHotel', () => {
        it('should create a hotel', async () => {
            mockHotelService.create.mockResolvedValue(mockHotel);

            const result = await controller.createHotel(mockHotel);
            expect(hotelService.create).toHaveBeenCalledWith(mockHotel);
            expect(result).toEqual({
                id: mockHotel._id.toString(),
                title: mockHotel.title,
                description: mockHotel.description,
            });
        });

        it('should throw NotFoundException if hotel ID is invalid', async () => {
        await expect(controller.createHotel({ _id: 'invalid_id', title: 'Invalid', description: 'Invalid' }))
            .rejects
            .toThrow(NotFoundException);
        });
    });

    describe('getHotels', () => {
        it('should handle NaN values for limit and offset', async () => {
            const mockHotels = [
                { _id: new Types.ObjectId(), title: 'Hotel 1', description: 'Description 1' },
            ];

            hotelService.search = jest.fn().mockResolvedValue(mockHotels);

            const result = await controller.getHotels(NaN, NaN);

            expect(result).toEqual(mockHotels.map(hotel => ({
                id: hotel._id.toString(),
                title: hotel.title,
                description: hotel.description,
            })));

            expect(hotelService.search).toHaveBeenCalledWith({
                limit: 10,
                offset: 0,
                title: '',
            });
        });

        it('should return hotels with default limit and offset', async () => {
            const mockHotels = [
                { _id: new Types.ObjectId(), title: 'Hotel 1', description: 'Description 1' },
                { _id: new Types.ObjectId(), title: 'Hotel 2', description: 'Description 2' },
            ];

            hotelService.search = jest.fn().mockResolvedValue(mockHotels);

            const result = await controller.getHotels();

            expect(result).toEqual(mockHotels.map(hotel => ({
                id: hotel._id.toString(),
                title: hotel.title,
                description: hotel.description,
            })));

            expect(hotelService.search).toHaveBeenCalledWith({
                limit: 10,
                offset: 0,
                title: '',
            });
        });

        it('should return a list of hotels', async () => {
            const mockHotels = [
                { _id: new Types.ObjectId(), title: 'Hotel 1', description: 'Description 1' },
                { _id: new Types.ObjectId(), title: 'Hotel 2', description: 'Description 2' },
            ];

            hotelService.search = jest.fn().mockResolvedValue(mockHotels);

            const response = await controller.getHotels({ limit: '10', offset: '0', title: '' } as any);

            expect(hotelService.search).toHaveBeenCalledWith({ limit: 10, offset: 0, title: '' });
            expect(response).toEqual(
                mockHotels.map(hotel => ({
                id: hotel._id.toString(),
                title: hotel.title,
                description: hotel.description,
                })),
            );
        });

        it('should return a filtered list of hotels based on title', async () => {
            const mockHotels = [
                { _id: new Types.ObjectId(), title: 'Hotel 1', description: 'Description 1' },
            ];
            jest.spyOn(hotelService, 'search').mockResolvedValue(mockHotels);

            const result = await controller.getHotels(10, 0, 'Hotel 1');

            expect(result).toEqual([
                { id: mockHotels[0]._id.toString(), title: mockHotels[0].title, description: mockHotels[0].description },
            ]);
            expect(hotelService.search).toHaveBeenCalledWith({ limit: 10, offset: 0, title: 'Hotel 1' });
        });

        it('should handle empty title', async () => {
            const mockHotels = [
                { _id: new Types.ObjectId(), title: 'Hotel 1', description: 'Description 1' },
            ];
            jest.spyOn(hotelService, 'search').mockResolvedValue(mockHotels);

            const result = await controller.getHotels({ limit: 10, offset: 0, title: '' } as any);

            expect(result).toEqual([
                { id: mockHotels[0]._id.toString(), title: mockHotels[0].title, description: mockHotels[0].description },
            ]);
            expect(hotelService.search).toHaveBeenCalledWith({ limit: 10, offset: 0, title: '' });
        });
    });

    describe('updateHotelDescription', () => {
        it('should update a hotel description', async () => {
            const updatedHotel = { ...mockHotel, description: 'Updated description' };
            mockHotelService.update.mockResolvedValue(updatedHotel);

            const result = await controller.updateHotelDescription(mockHotel._id.toString(), { title: mockHotel.title, description: 'Updated description' });
            expect(hotelService.update).toHaveBeenCalledWith(mockHotel._id.toString(), { title: mockHotel.title, description: 'Updated description' });
            expect(result).toEqual({
                id: mockHotel._id.toString(),
                title: mockHotel.title,
                description: 'Updated description',
            });
        });

        it('should throw NotFoundException if hotel not found', async () => {
            mockHotelService.update.mockResolvedValue(null);

            await expect(controller.updateHotelDescription(mockHotel._id.toString(), { title: mockHotel.title, description: 'Updated description' }))
                .rejects
                .toThrow(NotFoundException);
        });

        it('should throw NotFoundException if hotel ID is invalid', async () => {
            const invalidId = 'invalidHotelId';
            const updateHotelDTO = { title: 'New Title', description: 'Updated Description' };

            await expect(controller.updateHotelDescription(invalidId, updateHotelDTO))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('addHotelRoom', () => {
        it('should create a hotel room with images', async () => {
            mockHotelRoomService.create.mockResolvedValue(mockHotelRoom);

            const mockFiles = {
                images: [
                {
                    fieldname: 'images',
                    originalname: 'image1.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    buffer: Buffer.from(''),
                    size: 1024,
                    filename: 'image1.jpg',
                } as Express.Multer.File,
                ],
            };

            const result = await controller.addHotelRoom(
                {
                    hotel: {
                        _id: mockHotel._id,
                        title: mockHotel.title,
                        description: mockHotel.description
                },
                    description: 'Room description',
                    isEnable: true
                } as IHotelRoom,
                mockFiles
            );

            expect(hotelRoomService.create).toHaveBeenCalledWith({
                description: 'Room description',
                hotel: new Types.ObjectId(mockHotel._id),
                images: ['image1.jpg'],
                isEnable: true,
            });

            expect(result).toEqual({
                id: mockHotelRoom._id.toString(),
                description: mockHotelRoom.description,
                images: mockHotelRoom.images,
                isEnable: mockHotelRoom.isEnable,
                hotel: {
                    id: mockHotel._id.toString(),
                    title: mockHotel.title,
                    description: mockHotel.description,
                },
            });
        });

        it('should throw ForbiddenException if images are missing', async () => {
            const mockFiles = { images: [] };

            await expect(controller.addHotelRoom(
                {
                    hotel: {
                        _id: mockHotel._id,
                        title: mockHotel.title,
                        description: mockHotel.description
                },
                    description: 'Room description',
                    images: [],
                    isEnable: true
                } as IHotelRoom,
                mockFiles
            )).rejects.toThrow(ForbiddenException);
        });
    });
});
