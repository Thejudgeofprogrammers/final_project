import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { HotelModule } from "./hotel/hotel.module";
import { ReservationModule } from "./reservation/reservation.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SupportModule } from "./support/support.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { resolve } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, "../../.env"),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URL"),
      }),
    }),
    UsersModule,
    HotelModule,
    ReservationModule,
    SupportModule,
    AuthModule,
  ],
})
export class AppModule {}
