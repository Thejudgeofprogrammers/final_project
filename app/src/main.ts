import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';


export async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.use(session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    const configService = app.get(ConfigService);
    const port = configService.get<number>('HTTP_PORT') || 3000;
    await app.listen(port);
};
bootstrap();
