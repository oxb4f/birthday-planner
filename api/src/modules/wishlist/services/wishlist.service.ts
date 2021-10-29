import { Injectable } from "@nestjs/common";
import { EntityManager, QueryBuilder } from "@mikro-orm/postgresql";

import { CreateWishlistDto } from "../dto";
import { User } from "../../user/entities";
import { Wishlist } from "../entities";
import { WishlistOptionService } from "./wishlist-option.service";
import { WishlistRo } from "../interfaces";
import { UserService } from "../../user/services";
import { SearchWishlistDto } from "../dto/search-wishlist.dto";

@Injectable()
export class WishlistService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _userService: UserService,
    protected readonly _wishlistOptionService: WishlistOptionService,
  ) {}

  public async createWishlist(em: EntityManager, createWishlistDto: CreateWishlistDto, user: User): Promise<Wishlist> {
    const wishlist = new Wishlist(user, createWishlistDto.description);

    await Promise.all(
      createWishlistDto.options.map((optionDto) =>
        this._wishlistOptionService.createWishlistOption(em, optionDto, wishlist),
      ),
    );

    em.persist(wishlist);

    return wishlist;
  }

  public async getWishlistByWishlistId(
    em: EntityManager,
    wishlistId: number,
    populate: Array<string> = [],
  ): Promise<Wishlist | null> {
    const defaultPopulate = ["options", "user"];

    return em.findOne(Wishlist, { id: wishlistId }, [...defaultPopulate, ...populate]);
  }

  public async getWishlists(em: EntityManager, searchWishlistDto: SearchWishlistDto): Promise<Wishlist[]> {
    const [offset, limit] = [searchWishlistDto.offset ?? 0, searchWishlistDto.limit ?? 15];

    const wishlistsQuery: QueryBuilder<Wishlist> = em.createQueryBuilder(Wishlist, "w").select("w.*");

    if (searchWishlistDto.userId !== undefined) {
      wishlistsQuery.where({ user_id: searchWishlistDto.userId });
    }

    return wishlistsQuery.offset(offset).limit(limit).getResult();
  }

  public async buildWishlistRo(em: EntityManager, wishlist: Wishlist): Promise<WishlistRo> {
    await em.populate(wishlist, ["options", "user"]);

    return {
      wishlistId: wishlist.id,
      description: wishlist.description,
      user: await this._userService.buildUserRo(em, wishlist.user),
      options: await Promise.all(
        wishlist.options.getItems().map((option) => this._wishlistOptionService.buildWishlistOptionRo(em, option)),
      ),
    };
  }
}
