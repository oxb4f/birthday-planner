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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EntityManager } from "@mikro-orm/postgresql";
import { AuthGuard } from "@nestjs/passport";

import { CreateWishlistDto } from "../dto";
import { WishlistRo } from "../interfaces";
import { WishlistService } from "../services";
import { GetUserFromRequest } from "../../user/decorators";
import { User } from "../../user/entities";
import { SearchWishlistDto } from "../dto/search-wishlist.dto";

@ApiTags("wishlist")
@Controller()
export class WishlistController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _wishlistService: WishlistService,
  ) {}

  @ApiBearerAuth()
  @Post("/wishlist")
  @UseGuards(AuthGuard())
  public async createWishlist(
    @GetUserFromRequest() user: User,
    @Body(new ValidationPipe()) createWishlistDto: CreateWishlistDto,
  ): Promise<{ wishlist: WishlistRo }> {
    const wishlist = await this._em.transactional((em) =>
      this._wishlistService.createWishlist(em, createWishlistDto, user),
    );

    return {
      wishlist: await this._wishlistService.buildWishlistRo(this._em, wishlist),
    };
  }

  @Get("/wishlist/:wishlistId")
  public async getWishlistByWishlistId(
    @Param("wishlistId", ParseIntPipe) wishlistId: number,
  ): Promise<{ wishlist: WishlistRo }> {
    const wishlist = await this._wishlistService.getWishlist(this._em, {
      id: wishlistId,
    });

    return {
      wishlist: await this._wishlistService.buildWishlistRo(this._em, wishlist),
    };
  }

  @ApiBearerAuth()
  @Get("/wishlists")
  @UseGuards(AuthGuard())
  public async getWishlists(
    @Query(new ValidationPipe({ transform: true }))
    searchWishlistDto: SearchWishlistDto,
  ): Promise<WishlistRo[]> {
    const wishlists = await this._wishlistService.getWishlists(
      this._em,
      { user: searchWishlistDto.userId as unknown as User },
      [],
      searchWishlistDto.offset,
      searchWishlistDto.limit,
    );

    return Promise.all(
      wishlists.map((wishlist) =>
        this._wishlistService.buildWishlistRo(this._em, wishlist),
      ),
    );
  }
}
