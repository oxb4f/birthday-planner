import { Injectable } from "@nestjs/common";
import { EntityManager, QueryBuilder } from "@mikro-orm/postgresql";

import { CreateWishlistDto } from "../dto";
import { User } from "../../user/entities";
import { Wishlist } from "../entities";
import { WishlistOptionService } from "./wishlist-option.service";
import { WishlistRo } from "../interfaces";
import { UserService } from "../../user/services";
import { SearchWishlistDto } from "../dto";
import { excludeKeys } from "src/modules/shared/helpers";

@Injectable()
export class WishlistService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _userService: UserService,
    protected readonly _wishlistOptionService: WishlistOptionService,
  ) {}

  public async createWishlist(
    em: EntityManager,
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const wishlist = new Wishlist(user, createWishlistDto.description);

    await Promise.all(
      createWishlistDto.options.map((optionDto) =>
        this._wishlistOptionService.createWishlistOption(
          em,
          optionDto,
          wishlist,
        ),
      ),
    );

    em.persist(wishlist);

    return wishlist;
  }

  public async getWishlist(
    em: EntityManager,
    filter: { [Prop in keyof Wishlist]+?: Wishlist[Prop] },
    populate: Array<string> = [],
  ): Promise<Wishlist> {
    const defaultPopulate = ["options", "user"];

    return em.findOneOrFail(Wishlist, filter as Required<typeof filter>, [
      ...defaultPopulate,
      ...populate,
    ])
  }

  public async getWishlists(
    em: EntityManager,
    filter: { [Prop in keyof Wishlist]+?: Wishlist[Prop] },
    populate: Array<string> = [],
    offset = 0,
    limit = 15,
  ): Promise<Wishlist[]> {
    const defaultPopulate = ["options", "user"];

    return em.find(Wishlist, filter as Required<typeof filter>, [
      ...defaultPopulate,
      ...populate,
    ], { "createdAt": "DESC" }, limit, offset);
  }

  public async buildWishlistRo(
    em: EntityManager,
    wishlist: Wishlist,
  ): Promise<WishlistRo> {
    await em.populate(wishlist, ["options", "user"]);

    return {
      wishlistId: wishlist.id,
      description: wishlist.description,
      user: await this._userService.buildUserRo(em, wishlist.user),
      options: await Promise.all(
        wishlist.options
          .getItems()
          .map((option) =>
            this._wishlistOptionService.buildWishlistOptionRo(em, option),
          ),
      ),
    };
  }
}
