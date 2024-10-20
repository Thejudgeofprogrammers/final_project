import { Test, TestingModule } from "@nestjs/testing";
import { ReservationManagerController } from "../../../modules/reservation/controllers/reservation-manager.controller";
import { ReservationManagerService } from "../../../modules/reservation/services/reservation-manager.service";
import { Types } from "mongoose";
import { BadRequestException } from "@nestjs/common";

describe("ReservationManagerController", () => {
  let controller: ReservationManagerController;
  let service: ReservationManagerService;

  const mockReservations = [
    {
      dateStart: new Date(),
      dateEnd: new Date(),
      roomId: {
        description: "Room description",
        images: ["image1.jpg", "image2.jpg"],
      },
      hotelId: {
        title: "Hotel Title",
        description: "Hotel Description",
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationManagerController],
      providers: [
        {
          provide: ReservationManagerService,
          useValue: {
            getReservationsByUser: jest
              .fn()
              .mockResolvedValue(mockReservations),
            removeReservationByManager: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<ReservationManagerController>(
      ReservationManagerController,
    );
    service = module.get<ReservationManagerService>(ReservationManagerService);
  });

  describe("getReservationsByUser", () => {
    it("should return reservations for the given user ID", async () => {
      const userId = new Types.ObjectId();
      const result = await controller.getReservationsByUser(userId);

      expect(service.getReservationsByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(
        mockReservations.map((reservation) => ({
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
        })),
      );
    });
  });

  describe("removeReservationByManager", () => {
    it("should call removeReservationByManager with the correct ID", async () => {
      const reservationId: any = new Types.ObjectId();
      await controller.removeReservationByManager(reservationId);

      expect(service.removeReservationByManager).toHaveBeenCalledWith(
        reservationId,
      );
    });

    it("should throw BadRequestException if the reservation does not exist", async () => {
      const reservationId: any = new Types.ObjectId();
      jest
        .spyOn(service, "removeReservationByManager")
        .mockRejectedValue(
          new BadRequestException(
            "Reservation with the specified ID does not exist!",
          ),
        );

      await expect(
        controller.removeReservationByManager(reservationId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
