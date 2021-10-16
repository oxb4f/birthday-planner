import { EntityManager } from "@mikro-orm/postgresql";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ConfigService } from "../../shared/services";
import { User } from "../../user/entities";
import { UserService } from "../../user/services";
import { IJwtPayload } from "../interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _userService: UserService,
    protected readonly _configService: ConfigService,
  ) {
    super({
      secretOrKey: _configService.get("JWT_SECRET_KEY"),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  public async validate(payload: IJwtPayload): Promise<User> {
    const user = await this._userService.getUserByUserId(payload.userId, this._em);

    if (!user) {
      throw new HttpException("User not found.", HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
