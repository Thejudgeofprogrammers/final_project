import { diskStorage } from "multer";
import { extname } from "path";
import { MulterModuleOptions } from "@nestjs/platform-express";
import { Request } from "express";
import { resolve } from "path";

export const multerConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: resolve(
      __dirname,
      `../../${process.env.LOCAL_PATH ? process.env.LOCAL_PATH.toString() : "uploads"}`,
    ),
    filename: (req: Request, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
