import { EntityManager } from "@mikro-orm/postgresql";
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { GetUserFromRequest } from "../../user/decorators";
import { User } from "../../user/entities";
import { CreateRoomDto, SearchRoomDto } from "../dto";
import { RoomRo } from "../interfaces";
import { RoomService } from "../services";

@ApiTags("room")
@Controller()
export class RoomController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _roomService: RoomService,
  ) {}

  @ApiBearerAuth()
  @Post("/room")
  @UseGuards(AuthGuard())
  public async createRoom(
    @GetUserFromRequest() user: User,
    @Body(new ValidationPipe()) createRoomDto: CreateRoomDto,
  ): Promise<{ room: RoomRo }> {
    const room = await this._em.transactional((em) =>
      this._roomService.createRoom(em, createRoomDto, user),
    );

    return { room: await this._roomService.buildRoomRo(this._em, room) };
  }

  @ApiBearerAuth()
  @Get("/room/:roomId")
  @UseGuards(AuthGuard())
  public async getRoomById(
    @Param("roomId", ParseIntPipe) roomId: number,
  ): Promise<{ room: RoomRo }> {
    const room = await this._roomService.getRoom(this._em, { id: roomId });

    return { room: await this._roomService.buildRoomRo(this._em, room) };
  }

  @ApiBearerAuth()
  @Get("/rooms")
  @UseGuards(AuthGuard())
  public async getRooms(
    @GetUserFromRequest() user: User,
    @Query(new ValidationPipe()) searchRoomDto: SearchRoomDto,
  ): Promise<Array<RoomRo>> {
    const rooms = await this._roomService.getRooms(
      this._em,
      { owner: user.id },
      [],
      searchRoomDto.offset,
      searchRoomDto.limit,
    );

    return Promise.all(
      rooms.map((room) => this._roomService.buildRoomRo(this._em, room)),
    );
  }
}
