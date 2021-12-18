import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";

import { Room, RoomParticipant } from "../entities";
import { User } from "../../user/entities";
import { RoomParticipantRo, RoomParticipantRoOptions } from "../interfaces";
import { Role } from "../constants/enum";
import { Mutable } from "../../shared/types";
import { UserService } from "../../user/services";
import { RoomService } from "./room.service";

@Injectable()
export class RoomParticipantService {
  constructor(
    protected readonly _userService: UserService,
    @Inject(forwardRef(() => RoomService))
    protected readonly _roomService: RoomService,
    @InjectPinoLogger(RoomParticipantService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async createRoomParticipant(
    em: EntityManager,
    user: User,
    room: Room,
  ): Promise<RoomParticipant> {
    const roomParticipant = new RoomParticipant(user, room);

    if (user.id === room.owner?.id) {
      roomParticipant.roles.push(Role.OWNER);
    }

    em.persist(roomParticipant);

    return roomParticipant;
  }

  public async isUserRoomParticipant(
    em: EntityManager,
    userId: number,
    roomId: number,
  ): Promise<boolean> {
    return (
      (await em.count(RoomParticipant, { user: userId, room: roomId })) > 0
    );
  }

  public async buildRoomParticipantRo(
    em: EntityManager,
    roomParticipant: RoomParticipant,
    roomParticipantRoOptions?: RoomParticipantRoOptions,
  ): Promise<RoomParticipantRo> {
    const populate: Array<string> = ["user"];

    if (roomParticipantRoOptions?.showRoom) {
      populate.push("room");
    }

    await em.populate(roomParticipant, populate);

    const roomParticipantRo = {
      roomParticipantId: roomParticipant.id,
      roles: roomParticipant.roles,
      user: await this._userService.buildUserRo(em, roomParticipant.user),
    } as Mutable<RoomParticipantRo>;

    roomParticipantRo.room = !!roomParticipantRoOptions?.showRoom
      ? await this._roomService.buildRoomRo(em, roomParticipant.room)
      : undefined;

    return roomParticipantRo;
  }
}
