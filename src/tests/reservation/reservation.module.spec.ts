import { Test, TestingModule } from "@nestjs/testing";
import { ReservationModule } from "../../modules/reservation/reservation.module";
import { ReservationService } from "../../modules/reservation/services/reservation.service";
import { ReservationManagerService } from "../../modules/reservation/services/reservation-manager.service";
import { ReservationController } from "../../modules/reservation/controllers/reservation.controller";
import { ReservationManagerController } from "../../modules/reservation/controllers/reservation-manager.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { Reservation } from "../../modules/reservation/models/reservation.model";
import { HotelRoom } from "../../modules/hotel/models/hotel-room.model";
import { Hotel } from "../../modules/hotel/models/hotel.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

describe("ReservationModule", () => {
  let module: TestingModule;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    module = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUri), ReservationModule],
    }).compile();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should be defined", () => {
    const reservationService =
      module.get<ReservationService>(ReservationService);
    const reservationManagerService = module.get<ReservationManagerService>(
      ReservationManagerService,
    );
    const reservationController = module.get<ReservationController>(
      ReservationController,
    );
    const reservationManagerController =
      module.get<ReservationManagerController>(ReservationManagerController);

    expect(reservationService).toBeDefined();
    expect(reservationManagerService).toBeDefined();
    expect(reservationController).toBeDefined();
    expect(reservationManagerController).toBeDefined();
  });

  it("should provide Reservation model", () => {
    const reservationModel = module.get(getModelToken(Reservation.name));
    expect(reservationModel).toBeDefined();
  });

  it("should provide HotelRoom model", () => {
    const hotelRoomModel = module.get(getModelToken(HotelRoom.name));
    expect(hotelRoomModel).toBeDefined();
  });

  it("should provide Hotel model", () => {
    const hotelModel = module.get(getModelToken(Hotel.name));
    expect(hotelModel).toBeDefined();
  });
});
