import { Test, TestingModule } from "@nestjs/testing";
import { ReservationManagerService } from "../../../modules/reservation/services/reservation-manager.service";
import { getModelToken } from "@nestjs/mongoose";
import { Reservation } from "../../../modules/reservation/models/reservation.model";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";

describe("ReservationManagerService", () => {
  let service: ReservationManagerService;
  let mockReservationModel;

  const mockReservations = [
    {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      roomId: new Types.ObjectId(),
      hotelId: new Types.ObjectId(),
      description: "Sample Reservation",
    },
  ];

  beforeEach(async () => {
    mockReservationModel = {
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockReservations),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationManagerService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
      ],
    }).compile();

    service = module.get<ReservationManagerService>(ReservationManagerService);
  });

  describe("getReservationsByUser", () => {
    it("should return reservations for a given user ID", async () => {
      const userId = new Types.ObjectId();
      const result = await service.getReservationsByUser(userId);
      expect(mockReservationModel.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockReservations);
    });
  });

  describe("removeReservationByManager", () => {
    it("should remove a reservation by ID", async () => {
      const reservationId = new Types.ObjectId();
      mockReservationModel.findById.mockResolvedValue(mockReservations[0]);
      mockReservationModel.findByIdAndDelete.mockResolvedValue(
        mockReservations[0],
      );

      await service.removeReservationByManager(reservationId);
      expect(mockReservationModel.findById).toHaveBeenCalledWith(reservationId);
      expect(mockReservationModel.findByIdAndDelete).toHaveBeenCalledWith(
        reservationId,
      );
    });

    it("should throw BadRequestException if reservation does not exist", async () => {
      const reservationId = new Types.ObjectId();
      mockReservationModel.findById.mockResolvedValue(null);

      await expect(
        service.removeReservationByManager(reservationId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.removeReservationByManager(reservationId),
      ).rejects.toThrow("Reservation with the specified ID does not exist!");
    });
  });
});
