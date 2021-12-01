import { EntityManager } from "@mikro-orm/postgresql";
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { GetUserFromRequest } from "../../user/decorators";
import { User } from "../../user/entities";
import { CreateRoomDto } from "../dto";
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
}
