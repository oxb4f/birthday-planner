import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import type { Response } from "express";

import { RoomInviteService } from "../services";
import { GetUserFromRequest } from "../../user/decorators";
import { User } from "../../user/entities";
import { ConfigService } from "../../shared/services";

@ApiTags("room-invite")
@Controller()
export class RoomInviteController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _roomInviteService: RoomInviteService,
    protected readonly _configService: ConfigService,
  ) {}

  @ApiBearerAuth()
  @Get("/room-invite/:token")
  @UseGuards(AuthGuard())
  public async roomEntry(
    @Res() res: Response,
    @GetUserFromRequest() user: User,
    @Param("token") token: string,
  ): Promise<void> {
    await this._em.transactional((em) =>
      this._roomInviteService.roomEntry(em, user, token),
    );

    res.redirect(this._configService.get("APP_PUBLIC_URL"));
  }

  @ApiBearerAuth()
  @Get("/room-invite")
  @UseGuards(AuthGuard())
  public async getRoomInvite(
    @Query("roomId", ParseIntPipe) roomId: number,
  ): Promise<{ url: string }> {
    return {
      url: await this._roomInviteService.getRoomInvite(this._em, roomId),
    };
  }
}
