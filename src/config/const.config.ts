import { HttpStatus } from "@nestjs/common";

export const HTTP_STATUS = {
  OK: HttpStatus.OK,
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  INTERNAL_SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  CONFLICT: HttpStatus.CONFLICT,
};
