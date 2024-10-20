import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { ConfigService } from "@nestjs/config";
import * as session from "express-session";
import * as passport from "passport";

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "defaultSecret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  const configService = app.get(ConfigService);
  const port = configService.get<number>("HTTP_PORT") || 4000;
  await app.listen(port);
}
bootstrap();
