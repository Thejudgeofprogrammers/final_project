import { Test, TestingModule } from "@nestjs/testing";
import { HotelController } from "../../../modules/hotel/controllers/hotel.controller";
import { HotelRoomService } from "../../../modules/hotel/services/hotel-room.service";
import { Types } from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { HotelService } from "../../../modules/hotel/services/hotel.service";

describe("HotelController", () => {
  let hotelController: HotelController;
  let hotelRoomService: HotelRoomService;
  let hotelService: HotelService;

  const mockHotelRoomService = {
    search: jest.fn(),
    findById: jest.fn(),
  };

  const mockHotelService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelController],
      providers: [
        {
          provide: HotelService,
          useValue: mockHotelService,
        },
        {
          provide: HotelRoomService,
          useValue: mockHotelRoomService,
        },
      ],
    }).compile();

    hotelService = module.get<HotelService>(HotelService);
    hotelController = module.get<HotelController>(HotelController);
    hotelRoomService = module.get<HotelRoomService>(HotelRoomService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("searchHotelRooms", () => {
    it("should correctly map hotel ID when hotel is an ObjectId", async () => {
      const hotelId = new Types.ObjectId();
      const mockRooms = [
        {
          _id: new Types.ObjectId(),
          description: "Room 1",
          images: ["image1.jpg"],
          hotel: hotelId,
        },
      ];

      mockHotelService.findById.mockResolvedValue({
        _id: hotelId,
        title: "Test Hotel",
        description: "Hotel Description",
      });

      mockHotelRoomService.search.mockResolvedValue(mockRooms);

      const result = await hotelController.searchHotelRooms(
        10,
        0,
        hotelId.toString(),
      );

      expect(result).toEqual(
        mockRooms.map((room) => ({
          id: room._id.toString(),
          description: room.description,
          images: room.images,
          hotel: {
            id: hotelId.toString(),
            title: "Test Hotel",
            description: "Hotel Description",
          },
        })),
      );
      expect(hotelRoomService.search).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        hotel: hotelId,
      });
    });

    it("should handle invalid limit and offset values", async () => {
      const mockRooms = [
        {
          _id: new Types.ObjectId(),
          description: "Room 1",
          images: ["image1.jpg"],
          hotel: {
            _id: new Types.ObjectId(),
            title: "Hotel 1",
          },
        },
      ];

      mockHotelRoomService.search.mockResolvedValue(mockRooms);

      const result = await hotelController.searchHotelRooms(
        -5,
        -1,
        mockRooms[0].hotel._id.toString(),
      );

      expect(result).toEqual(
        mockRooms.map((room) => ({
          id: room._id.toString(),
          description: room.description,
          images: room.images,
          hotel: {
            id: room.hotel._id.toString(),
            title: room.hotel.title,
          },
        })),
      );

      expect(hotelRoomService.search).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        hotel: mockRooms[0].hotel._id,
      });
    });

    it("should return empty array if no rooms found", async () => {
      mockHotelRoomService.search.mockResolvedValue([]);

      const result = await hotelController.searchHotelRooms(10, 0, null);

      expect(result).toEqual([]);
      expect(hotelRoomService.search).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        hotel: null,
      });
    });
  });

  describe("searchHotelRoomById", () => {
    it("should return a hotel room with hotel as ObjectId", async () => {
      const mockRoom = {
        _id: new Types.ObjectId(),
        description: "Room 1",
        images: ["image1.jpg"],
        hotel: new Types.ObjectId(),
      };

      mockHotelRoomService.findById.mockResolvedValue(mockRoom);

      const result = await hotelController.searchHotelRoomById(
        mockRoom._id.toString(),
      );

      expect(result).toEqual({
        id: mockRoom._id.toString(),
        description: mockRoom.description,
        images: mockRoom.images,
        hotel: {
          id: mockRoom.hotel.toString(),
          title: undefined,
          description: undefined,
        },
      });

      expect(hotelRoomService.findById).toHaveBeenCalledWith(
        mockRoom._id.toString(),
      );
    });

    it("should return a hotel room by ID", async () => {
      const mockRoom = {
        _id: new Types.ObjectId(),
        description: "Room 1",
        images: ["image1.jpg"],
        hotel: {
          _id: new Types.ObjectId(),
          title: "Hotel 1",
          description: "Hotel description",
        },
      };

      mockHotelRoomService.findById.mockResolvedValue(mockRoom);

      const result = await hotelController.searchHotelRoomById(
        mockRoom._id.toString(),
      );

      expect(result).toEqual({
        id: mockRoom._id.toString(),
        description: mockRoom.description,
        images: mockRoom.images,
        hotel: {
          id: mockRoom.hotel._id.toString(),
          title: mockRoom.hotel.title,
          description: mockRoom.hotel.description,
        },
      });

      expect(hotelRoomService.findById).toHaveBeenCalledWith(
        mockRoom._id.toString(),
      );
    });

    it("should throw NotFoundException if hotel room not found", async () => {
      mockHotelRoomService.findById.mockResolvedValue(null);

      await expect(
        hotelController.searchHotelRoomById(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);

      expect(hotelRoomService.findById).toHaveBeenCalled();
    });

    it("should throw NotFoundException if ID is invalid", async () => {
      await expect(
        hotelController.searchHotelRoomById("invalid-id"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
