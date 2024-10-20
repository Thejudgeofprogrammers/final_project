import { Test, TestingModule } from "@nestjs/testing";
import { HotelModule } from "../../modules/hotel/hotel.module";
import { HotelService } from "../../modules/hotel/services/hotel.service";
import { HotelRoomService } from "../../modules/hotel/services/hotel-room.service";
import { HotelController } from "../../modules/hotel/controllers/hotel.controller";
import { HotelRoomController } from "../../modules/hotel/controllers/hotel-room.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { Hotel, HotelSchema } from "../../modules/hotel/models/hotel.model";
import {
  HotelRoom,
  HotelRoomSchema,
} from "../../modules/hotel/models/hotel-room.model";
import { ConfigModule } from "@nestjs/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

describe("HotelModule", () => {
  let module: TestingModule;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        ConfigModule.forRoot(),
        HotelModule,
      ],
    }).compile();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should be defined", () => {
    const hotelService = module.get<HotelService>(HotelService);
    const hotelRoomService = module.get<HotelRoomService>(HotelRoomService);
    const hotelController = module.get<HotelController>(HotelController);
    const hotelRoomController =
      module.get<HotelRoomController>(HotelRoomController);

    expect(hotelService).toBeDefined();
    expect(hotelRoomService).toBeDefined();
    expect(hotelController).toBeDefined();
    expect(hotelRoomController).toBeDefined();
  });

  it("should provide Hotel model", () => {
    const hotelModel = module.get(getModelToken(Hotel.name));
    expect(hotelModel).toBeDefined();
  });

  it("should provide HotelRoom model", () => {
    const hotelRoomModel = module.get(getModelToken(HotelRoom.name));
    expect(hotelRoomModel).toBeDefined();
  });
});
