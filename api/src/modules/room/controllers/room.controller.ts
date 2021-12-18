import { EntityManager } from "@mikro-orm/postgresql";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { GetUserFromRequest } from "../../user/decorators";
import { User } from "../../user/entities";
import { CreateRoomDto, SearchRoomDto, UpdateRoomDto } from "../dto";
import { RoomRo } from "../interfaces";
import { RoomService } from "../services";
import { RolesGuard } from "../guards";
import { Role } from "../constants/enum";
import { Roles } from "../decorators";

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
  @Roles(Role.PARTICIPANT)
  @UseGuards(AuthGuard(), RolesGuard)
  public async getRoomById(
    @GetUserFromRequest() user: User,
    @Param("roomId", ParseIntPipe) roomId: number,
  ): Promise<{ room: RoomRo }> {
    const room = await this._roomService.getRoom(this._em, {
      id: roomId,
    });

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
      { userId: user.id },
      [],
      searchRoomDto.offset,
      searchRoomDto.limit,
    );

    return Promise.all(
      rooms.map((room) => this._roomService.buildRoomRo(this._em, room)),
    );
  }

  @ApiBearerAuth()
  @Delete("/room/delete")
  @Roles(Role.OWNER)
  @UseGuards(AuthGuard(), RolesGuard)
  public async deleteRoom(
    @GetUserFromRequest() user: User,
    @Query("roomId", ParseIntPipe) roomId: number,
  ): Promise<{ result: boolean }> {
    await this._em.transactional((em) =>
      this._roomService.deleteRoom(em, roomId),
    );

    return { result: true };
  }

  @ApiBearerAuth()
  @Patch("/room/update")
  @Roles(Role.OWNER)
  @UseGuards(AuthGuard(), RolesGuard)
  public async updateRoom(
    @Query("roomId", ParseIntPipe) roomId: number,
    @Body(new ValidationPipe()) updateRoomDto: UpdateRoomDto,
  ): Promise<{ room: RoomRo }> {
    const room = await this._em.transactional((em) =>
      this._roomService.updateRoom(em, roomId, updateRoomDto),
    );

    return { room: await this._roomService.buildRoomRo(this._em, room) };
  }
}
