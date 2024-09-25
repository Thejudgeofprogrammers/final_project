import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HotelRoomService } from '../../../modules/hotel/services/hotel-room.service';
import { HotelRoom } from '../../../modules/hotel/models/hotel-room.model';

describe('HotelRoomService', () => {
    let service: HotelRoomService;
    let model: Model<HotelRoom>;

    const mockHotelRoom = {
        _id: new Types.ObjectId(),
        hotel: new Types.ObjectId(),
        description: 'Test description',
        images: ['image1.jpg', 'image2.jpg'],
        isEnable: true,
    };

    const mockHotelRoomModel = {
        create: jest.fn(),
        findById: jest.fn(),
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        exec: jest.fn(),
        populate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            HotelRoomService,
            {
                provide: getModelToken(HotelRoom.name),
                useValue: mockHotelRoomModel,
            },
        ],
        }).compile();

        service = module.get<HotelRoomService>(HotelRoomService);
        model = module.get<Model<HotelRoom>>(getModelToken(HotelRoom.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a hotel room', async () => {
            mockHotelRoomModel.create.mockResolvedValue(mockHotelRoom);
            mockHotelRoomModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockHotelRoom),
                }),
            });

            const result = await service.create(mockHotelRoom);
            expect(model.create).toHaveBeenCalledWith(mockHotelRoom);
            expect(result).toEqual(mockHotelRoom);
            });

        it('should throw an error if create fails', async () => {
            mockHotelRoomModel.create.mockRejectedValue(new Error('Database error'));

            await expect(service.create({ title: 'New Room' } as Partial<HotelRoom>)).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should return a hotel room by id', async () => {
            mockHotelRoomModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockHotelRoom),
            });

            const result = await service.findById(mockHotelRoom._id);
            expect(model.findById).toHaveBeenCalledWith(mockHotelRoom._id);
            expect(result).toEqual(mockHotelRoom);
        });

        it('should throw an error if findById fails', async () => {
            mockHotelRoomModel.findById.mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Hotel room not found')),
            });

            await expect(service.findById(mockHotelRoom._id)).rejects.toThrow('Hotel room not found');
        });
    });

    describe('search', () => {
        it('should return a list of hotel rooms', async () => {
            mockHotelRoomModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([mockHotelRoom]),
            });

            const params = { limit: 10, offset: 0, hotel: mockHotelRoom.hotel };
            const result = await service.search(params);
            expect(model.find).toHaveBeenCalledWith({ isEnable: true, hotel: params.hotel });
            expect(result).toEqual([mockHotelRoom]);
        });

        it('should throw an error if search fails', async () => {
            mockHotelRoomModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockRejectedValue(new Error('Database error')),
            });

            await expect(service.search({ hotel: new Types.ObjectId(), offset: 0, limit: 10 })).rejects.toThrow('Database error');
        });
    });

    describe('update', () => {
        it('should update a hotel room by id', async () => {
            const updateData = { description: 'Updated description' };
            mockHotelRoomModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ ...mockHotelRoom, ...updateData }),
            });

            const result = await service.update(mockHotelRoom._id, updateData);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockHotelRoom._id, updateData, { new: true });
            expect(result.description).toEqual('Updated description');
        });

        it('should throw an error if update fails', async () => {
            mockHotelRoomModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Update failed')),
            });

            await expect(service.update(mockHotelRoom._id, {})).rejects.toThrow('Update failed');
        });
    });
});
