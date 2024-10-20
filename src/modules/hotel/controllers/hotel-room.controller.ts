import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { HotelService } from "../services/hotel.service";
import {
  HotelWithId,
  ICreateHotelRoomDTO,
  IHotelParams,
  UpdateHotelParams,
} from "../dto";
import { Roles } from "../../../decorators/roles.decorator";
import { Types } from "mongoose";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { HotelRoomService } from "../services/hotel-room.service";
import { multerConfig } from "../../../config/multer.config";
import { RoleGuard } from "../../../guards/roles-guard";
import { AuthGuard } from "@nestjs/passport";
import { Express } from "express";
import { HTTP_STATUS } from "../../../config/const.config";
@Controller("admin")
@UseGuards(AuthGuard("session"), RoleGuard)
export class HotelRoomController {
  constructor(
    private readonly hotelService: HotelService,
    private readonly hotelRoomService: HotelRoomService,
  ) {}

  @Roles("admin")
  @Post("hotels")
  async createHotel(@Body() hotelParams: IHotelParams) {
    if (!Types.ObjectId.isValid((hotelParams as any)._id)) {
      throw new NotFoundException({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Invalid hotel ID",
      });
    }
    const hotel = await this.hotelService.create(hotelParams);

    return {
      id: hotel._id.toString(),
      title: hotel.title,
      description: hotel.description,
    };
  }

  @Roles("admin")
  @Get("hotels")
  async getHotels(
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("offset", ParseIntPipe) offset: number = 0,
    @Query("title") title: string = "",
  ) {
    const hotels = await this.hotelService.search({
      limit: isNaN(limit) ? 10 : limit,
      offset: isNaN(offset) ? 0 : offset,
      title: title || "",
    });

    return hotels.map((hotel: HotelWithId) => ({
      id: hotel._id.toString(),
      title: hotel.title,
      description: hotel.description,
    }));
  }

  @Roles("admin")
  @Put("hotel-rooms/:id")
  async updateHotelDescription(
    @Param("id") id: string,
    @Body() updateHotelDTO: UpdateHotelParams,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Invalid hotel ID",
      });
    }
    const updatedHotel = await this.hotelService.update(id, updateHotelDTO);
    if (!updatedHotel) {
      throw new NotFoundException({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Hotel not found",
      });
    }

    return {
      id: (updatedHotel as HotelWithId)._id.toString(),
      title: updatedHotel.title,
      description: updatedHotel.description,
    };
  }

  @Roles("admin")
  @Post("hotel-rooms")
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "images", maxCount: 10 }], multerConfig),
  )
  async addHotelRoom(
    @Body() createHotelDTO: ICreateHotelRoomDTO,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    if (!files.images || files.images.length === 0) {
      throw new ForbiddenException({
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: "Images are required",
      });
    }
    const imagePaths = files.images.map((file) => file.filename);
    const hotel = await this.hotelService.findById(createHotelDTO.hotelId);
    const hotelRoom = await this.hotelRoomService.create({
      description: createHotelDTO.description,
      images: imagePaths,
      isEnable: true,
      hotel: hotel._id,
    });

    const populatedHotelRoom = await this.hotelRoomService.findByIdWithHotel(
      hotelRoom._id,
    );

    return {
      id: hotelRoom._id.toString(),
      description: hotelRoom.description,
      images: hotelRoom.images,
      isEnable: hotelRoom.isEnable,
      hotel: {
        id: populatedHotelRoom.hotel._id.toString(),
        title: (populatedHotelRoom.hotel as any).title,
        description: (populatedHotelRoom.hotel as any).description,
      },
    };
  }
}
