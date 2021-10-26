import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EntityManager } from "@mikro-orm/postgresql";
import { AuthGuard } from "@nestjs/passport";

import { ValidationPipe } from "../../shared/pipes";
import { CreateWishlistDto } from "../dto";
import { IWishlistRo } from "../interfaces";
import { WishlistService } from "../services";
import { GetUserFromRequest } from "../../user/decorators";
import { User } from "../../user/entities";

@ApiTags("wishlist")
@Controller()
export class WishlistController {
  constructor(protected readonly _em: EntityManager, protected readonly _wishlistService: WishlistService) {}

  @ApiBearerAuth()
  @Post("/wishlist")
  @UseGuards(AuthGuard())
  public async createWishlist(
    @GetUserFromRequest() user: User,
    @Body(new ValidationPipe()) createWishlistDto: CreateWishlistDto,
  ): Promise<{ wishlist: IWishlistRo }> {
    const wishlist = await this._em.transactional((em) =>
      this._wishlistService.createWishlist(em, createWishlistDto, user),
    );

    return { wishlist: await this._wishlistService.buildWishlistRo(this._em, wishlist) };
  }

  @Get("/wishlist/:wishlistId")
  public async getWishlistByWishlistId(
    @Param("wishlistId", ParseIntPipe) wishlistId: number,
  ): Promise<{ wishlist: IWishlistRo }> {
    const wishlist = await this._wishlistService.getWishlistByWishlistId(this._em, wishlistId);

    return { wishlist: await this._wishlistService.buildWishlistRo(this._em, wishlist) };
  }
}
