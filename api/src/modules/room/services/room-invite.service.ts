import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";

import { Room, RoomInvite } from "../entities";

@Injectable()
export class RoomInviteService {
  constructor(
    @InjectPinoLogger(RoomInviteService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async createRoomInvite(
    em: EntityManager,
    room: Room,
  ): Promise<RoomInvite> {
    const roomInvite = new RoomInvite(room);

    em.persist(roomInvite);

    return roomInvite;
  }
}
