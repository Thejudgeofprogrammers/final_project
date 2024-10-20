import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "../../modules/auth/auth.module";
import { AuthService } from "../../modules/auth/auth.service";
import { AuthController } from "../../modules/auth/auth.controller";
import { UsersModule } from "../../modules/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "../../local.strategy/local.strategy";
import { SessionSerializer } from "../../local.strategy/session.serializer";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "../../modules/users/models/user.model";
import { Model } from "mongoose";

describe("AuthModule", () => {
  let module: TestingModule;
  let userModel: Model<User>;

  beforeAll(async () => {
    userModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    } as any;

    module = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule.register({ session: true }),
        AuthModule,
      ],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(userModel)
      .compile();
  });

  it("should be defined", () => {
    const authService = module.get<AuthService>(AuthService);
    const authController = module.get<AuthController>(AuthController);
    const localStrategy = module.get<LocalStrategy>(LocalStrategy);
    const sessionSerializer = module.get<SessionSerializer>(SessionSerializer);

    expect(authService).toBeDefined();
    expect(authController).toBeDefined();
    expect(localStrategy).toBeDefined();
    expect(sessionSerializer).toBeDefined();
  });

  it("should provide User model", () => {
    const model = module.get(getModelToken(User.name));
    expect(model).toBeDefined();
  });
});
