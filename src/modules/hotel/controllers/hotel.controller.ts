import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  Query,
} from "@nestjs/common";
import { SearchRoomsParams } from "../dto";
import { HotelRoomService } from "../services/hotel-room.service";
import { Types } from "mongoose";
import { HotelService } from "../services/hotel.service";
import { HTTP_STATUS } from "../../../config/const.config";

@Controller("common/hotel-rooms")
export class HotelController {
  constructor(
    private readonly hotelRoomService: HotelRoomService,
    private readonly hotelService: HotelService,
  ) {}

  @Get()
  async searchHotelRooms(
    @Query("limit") limit: number,
    @Query("offset") offset: number,
    @Query("hotel") hotel: string,
    @Query("isEnable", ParseBoolPipe) isEnable?: boolean,
  ) {
    const params: SearchRoomsParams = {
      limit: Math.max(Number(limit), 10),
      offset: Math.max(Number(offset), 0),
      hotel: hotel ? new Types.ObjectId(hotel) : null,
      isEnable: typeof isEnable === "boolean" ? isEnable : undefined,
    };
    const rooms = await this.hotelRoomService.search(params);

    return Promise.all(
      rooms.map(async (room: any) => {
        let hotel = room.hotel;
        if (typeof hotel === "string" || hotel instanceof Types.ObjectId) {
          hotel = await this.hotelService.findById(hotel);
        }
        return {
          id: room._id.toString(),
          description: room.description,
          images: room.images,
          hotel: {
            id: hotel._id.toString(),
            title: hotel.title,
            description: hotel.description,
          },
        };
      }),
    );
  }

  @Get(":id")
  async searchHotelRoomById(@Param("id") id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Invalid hotel ID",
      });
    }
    const room = await this.hotelRoomService.findById(id);
    if (!room) {
      throw new NotFoundException({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Hotel room not found",
      });
    }
    const hotel = room.hotel;

    return {
      id: room._id.toString(),
      description: room.description,
      images: room.images,
      hotel: {
        id: hotel._id.toString(),
        title: (hotel as any).title,
        description: (hotel as any).description,
      },
    };
  }
}
