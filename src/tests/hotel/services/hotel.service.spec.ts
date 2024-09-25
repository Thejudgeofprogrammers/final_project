import { Test, TestingModule } from '@nestjs/testing';
import { HotelService } from '../../../modules/hotel/services/hotel.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hotel, HotelDocument } from '../../../modules/hotel/models/hotel.model';
import { IHotelParams, SearchHotelParams, UpdateHotelParams } from '../../../modules/hotel/dto';
import { NotFoundException } from '@nestjs/common';

describe('HotelService', () => {
    let hotelService: HotelService;
    let hotelModel: Model<HotelDocument>;

    const mockHotelModel = {
        create: jest.fn(),
        findById: jest.fn(),
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    };

    const mockHotel = {
        _id: new Types.ObjectId(),
        title: 'Hotel Test',
        description: 'Test Description',
        isEnable: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            HotelService,
            {
                provide: getModelToken(Hotel.name),
                useValue: mockHotelModel,
            },
        ],
        }).compile();

        hotelService = module.get<HotelService>(HotelService);
        hotelModel = module.get<Model<HotelDocument>>(getModelToken(Hotel.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new hotel', async () => {
            const hotelParams: IHotelParams = {
                title: 'New Hotel',
                description: 'New Hotel Description',
                isEnable: true,
            };

            mockHotelModel.create.mockResolvedValue(mockHotel);

            const result = await hotelService.create(hotelParams);

            expect(result).toEqual(mockHotel);
            expect(hotelModel.create).toHaveBeenCalledWith(hotelParams);
        });

        it('should throw an error if create fails', async () => {
            mockHotelModel.create.mockRejectedValue(new Error('Database error'));

            await expect(hotelService.create({ title: 'New Hotel' } as IHotelParams)).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should return a hotel by id', async () => {
            mockHotelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockHotel),
            });

            const result = await hotelService.findById(mockHotel._id);

            expect(result).toEqual(mockHotel);
            expect(hotelModel.findById).toHaveBeenCalledWith(mockHotel._id);
        });

        it('should throw NotFoundException if hotel is not found', async () => {
            mockHotelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(hotelService.findById(mockHotel._id)).rejects.toThrow(NotFoundException);
        });

        it('should handle errors gracefully', async () => {
            mockHotelModel.findById.mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Database error')),
            });

            await expect(hotelService.findById('invalidId')).rejects.toThrow('Database error');
        });
    });

    describe('search', () => {
        it('should return a list of hotels matching search criteria', async () => {
            const searchParams: SearchHotelParams = {
                title: 'Hotel',
                limit: 10,
                offset: 0,
            };

            const mockHotels = [mockHotel];
            mockHotelModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockHotels),
            });

            const result = await hotelService.search(searchParams);

            expect(result).toEqual(mockHotels);
            expect(hotelModel.find).toHaveBeenCalledWith({
                title: new RegExp(searchParams.title, 'i'),
            });
            expect(hotelModel.find().skip).toHaveBeenCalledWith(searchParams.offset);
            expect(hotelModel.find().limit).toHaveBeenCalledWith(searchParams.limit);
        });

        it('should handle errors gracefully', async () => {
            mockHotelModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockRejectedValue(new Error('Database error')),
            });

            await expect(hotelService.search({ title: 'Hotel', offset: 0, limit: 10 })).rejects.toThrow('Database error');
        });
    });

    describe('update', () => {
        it('should update a hotel and return the updated hotel', async () => {
            const updateParams: UpdateHotelParams = {
                title: 'Updated Hotel',
                description: 'Updated Description',
            };

            const updatedHotel = {
                ...mockHotel,
                ...updateParams,
            };

            mockHotelModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedHotel),
            });

            const result = await hotelService.update(mockHotel._id, updateParams);

            expect(result).toEqual(updatedHotel);
            expect(hotelModel.findByIdAndUpdate).toHaveBeenCalledWith(mockHotel._id, updateParams, { new: true });
        });

        it('should throw an error if update fails', async () => {
            mockHotelModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Update failed')),
            });

            const updateData = { title: 'Valid Title', description: 'Valid Description' };

            await expect(hotelService.update(mockHotel._id, updateData)).rejects.toThrow('Update failed');
        });
    });
});
