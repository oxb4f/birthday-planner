import { FilterQuery } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { User } from "../../user/entities";
import { UserService } from "../../user/services";
import { CreateRoomDto } from "../dto";
import { Room } from "../entities";
import { RoomRo } from "../interfaces";
import { RoomParticipantService } from "./room-participant.service";
import { RoomInviteService } from "./room-invite.service";
import { Mutable } from "../../shared/types";
import { excludeKeys } from "../../shared/helpers";

@Injectable()
export class RoomService {
  constructor(
    protected readonly _userService: UserService,
    protected readonly _roomParticipantService: RoomParticipantService,
    protected readonly _roomInviteService: RoomInviteService,
    @InjectPinoLogger(RoomService.name) protected readonly _logger: PinoLogger,
  ) {}

  public async createRoom(
    em: EntityManager,
    createRoomDto: CreateRoomDto,
    user: User,
  ): Promise<Room> {
    const room = new Room(createRoomDto.title, user);

    (room as Mutable<Room>).invite =
      await this._roomInviteService.createRoomInvite(em, room);

    await this._roomParticipantService.createRoomParticipant(em, user, room);

    em.persist(room);

    return room;
  }

  public async getRoom(
    em: EntityManager,
    filter: FilterQuery<Room> & { id: number; userId: number },
    populate: Array<string> = [],
  ): Promise<Room> {
    const isUserRoomParticipant =
      await this._roomParticipantService.isUserRoomParticipant(
        em,
        filter.userId,
        filter.id,
      );
    if (isUserRoomParticipant) {
      const defaultPopulate = ["owner"];

      return em.findOneOrFail(
        Room,
        excludeKeys(["userId"], filter) as Required<FilterQuery<Room>>,
        [...defaultPopulate, ...populate],
      );
    }

    throw new HttpException(
      "Room is not accessible for this user",
      HttpStatus.BAD_REQUEST,
    );
  }

  public async getRooms(
    em: EntityManager,
    filter: FilterQuery<Room> & { userId: number },
    populate: Array<string> = [],
    offset = 0,
    limit = 15,
  ): Promise<Array<Room>> {
    const roomQuery = em
      .createQueryBuilder(Room, "r")
      .select("r.*")
      .leftJoinAndSelect("participants", "rp", { "rp.user_id": filter.userId })
      .leftJoinAndSelect("owner", "ro")
      .where(excludeKeys(["userId"], filter))
      .andWhere({ "rp.id": { $ne: null } })
      .offset(offset)
      .limit(limit);

    const queryResult = await roomQuery.getResult();

    if (populate.length > 0) {
      return em.populate(queryResult, populate);
    }

    return queryResult;
  }

  public async buildRoomRo(em: EntityManager, room: Room): Promise<RoomRo> {
    await em.populate(room, ["owner"]);

    return {
      roomId: room.id,
      title: room.title,
      owner: await this._userService.buildUserRo(em, room.owner),
      createdAt: room.createdAt,
    } as RoomRo;
  }
}
