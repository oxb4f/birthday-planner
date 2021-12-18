import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ParseIntPipe,
} from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import { ROLES_METADATA_KEY } from "../decorators";
import { Role } from "../constants/enum";
import { User } from "../../user/entities";
import { RoomParticipant } from "../entities";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    protected readonly _reflector: Reflector,
    protected readonly _em: EntityManager,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const classLevelRoles =
      this._reflector.get<Array<Role>>(
        ROLES_METADATA_KEY,
        context.getClass(),
      ) || [];
    const handlerLevelRoles =
      this._reflector.get<Array<Role>>(
        ROLES_METADATA_KEY,
        context.getHandler(),
      ) || [];

    const rolesToValidate: Array<Role> = [
      ...classLevelRoles,
      ...handlerLevelRoles,
    ];
    if (rolesToValidate.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest() as Request;

    const user = req.user as User;
    if (!user) {
      return false;
    }

    const parseIntPipe = new ParseIntPipe();

    const rawRoomId = req.params.roomId ?? req.query.roomId;

    const roomId = await parseIntPipe.transform(rawRoomId as string, {
      type: "param",
      metatype: String,
      data: "roomId",
    });

    const roomParticipant = await this._em.findOne(RoomParticipant, {
      user: user.id,
      room: roomId,
    });
    if (!roomParticipant) {
      return false;
    }

    return rolesToValidate.some((role) => roomParticipant.roles.includes(role));
  }
}
