import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";

import { Room, RoomInvite } from "../entities";
import { ConfigService } from "../../shared/services";
import { User } from "../../user/entities";
import { RoomParticipantService } from "./room-participant.service";

@Injectable()
export class RoomInviteService {
  constructor(
    protected readonly _roomParticipantService: RoomParticipantService,
    protected readonly _configService: ConfigService,
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

  public async roomEntry(
    em: EntityManager,
    user: User,
    token: string,
  ): Promise<void> {
    const roomInvite = await em.findOneOrFail(RoomInvite, { token }, [
      "room.owner",
    ]);

    const isUserRoomParticipant =
      await this._roomParticipantService.isUserRoomParticipant(
        em,
        user.id,
        roomInvite.room.id,
      );
    if (!isUserRoomParticipant) {
      await this._roomParticipantService.createRoomParticipant(
        em,
        user,
        roomInvite.room,
      );
    }
  }

  public async getRoomInvite(
    em: EntityManager,
    roomId: number,
  ): Promise<string> {
    const roomInvite = await em.findOneOrFail(RoomInvite, { room: roomId });

    const url = new URL(
      `/api/room-invite/${roomInvite.token}`,
      this._configService.get("APP_PUBLIC_URL"),
    );

    return url.href;
  }
}
