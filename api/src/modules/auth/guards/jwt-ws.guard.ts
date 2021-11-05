import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

import { UserService } from "../../user/services";
import { JwtPayload } from "../interfaces";
import { ConfigService } from "../../shared/services";
import { EntityManager } from "@mikro-orm/postgresql";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _userService: UserService,
    protected readonly _configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();

    try {
      const jwtToken: string = client.handshake.headers["authorization"].split(" ")[1];

      const jwtPayload: JwtPayload = jwt.verify(jwtToken, this._configService.get("JWT_SECRET_KEY")) as JwtPayload;

      context.switchToWs().getData().user = await this._userService.getUserByUserId(this._em, jwtPayload.userId);

      return true;
    } catch {
      throw new WsException("Not authorized for using ws gateway");
    }
  }
}
