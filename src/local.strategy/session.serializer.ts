import { User } from "@/modules/users/models/user.model";
import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err, user: User) => void) {
    done(null, user);
  }

  deserializeUser(payload, done: (err, payload) => void) {
    done(null, payload);
  }
}
