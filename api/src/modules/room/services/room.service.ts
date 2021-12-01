import { FilterQuery } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { User } from "../../user/entities";
import { UserService } from "../../user/services";
import { CreateRoomDto } from "../dto";
import { Room } from "../entities";
import { RoomRo } from "../interfaces";

@Injectable()
export class RoomService {
  constructor(
    protected readonly _userService: UserService,
    @InjectPinoLogger(RoomService.name) protected readonly _logger: PinoLogger,
  ) {}

  public async createRoom(
    em: EntityManager,
    createRoomDto: CreateRoomDto,
    user: User,
  ): Promise<Room> {
    const room = new Room(createRoomDto.title, user);

    em.persist(room);

    return room;
  }

  public async getRoom(
    em: EntityManager,
    filter: FilterQuery<Room>,
    populate: Array<string> = [],
  ): Promise<Room> {
    const defaultPopulate = ["owner"];

    return em.findOneOrFail(Room, filter, [...defaultPopulate, ...populate]);
  }

  public async getRooms(
    em: EntityManager,
    filter: FilterQuery<Room>,
    populate: Array<string> = [],
    offset = 0,
    limit = 15,
  ): Promise<Array<Room>> {
    const defaultPopulate = ["owner"];

    return em.find(
      Room,
      filter,
      [...defaultPopulate, ...populate],
      { createdAt: "DESC" },
      limit,
      offset,
    );
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
