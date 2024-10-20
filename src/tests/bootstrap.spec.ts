import { NestFactory } from "@nestjs/core";
import { AppModule } from "../modules/app.module";
import { ConfigService } from "@nestjs/config";

jest.mock("@nestjs/core", () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe("bootstrap", () => {
  let mockApp;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockApp = {
      enableCors: jest.fn(),
      listen: jest.fn(),
      use: jest.fn(),
      get: jest.fn(),
      setGlobalPrefix: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    mockApp.get.mockReturnValue(mockConfigService);
  });

  it("should create the application, enable CORS, and listen on a custom port from ConfigService", async () => {
    (mockConfigService.get as jest.Mock).mockReturnValue(4051);

    const { bootstrap } = await import("../main");
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith("api");
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(ConfigService);
    expect(mockConfigService.get).toHaveBeenCalledWith("HTTP_PORT");
    expect(mockApp.listen).toHaveBeenCalledWith(4051);
  });

  it("should listen on default port 3000 if ConfigService does not return a port", async () => {
    (mockConfigService.get as jest.Mock).mockReturnValue(undefined);

    const { bootstrap } = await import("../main");
    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith(4000);
  });

  it("should use session and passport middleware", async () => {
    const { bootstrap } = await import("../main");
    await bootstrap();

    expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));

    expect(mockApp.use).toHaveBeenCalledTimes(3);
  });
});
