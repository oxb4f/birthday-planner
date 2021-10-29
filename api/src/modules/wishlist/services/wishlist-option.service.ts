import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { Wishlist, WishlistOption } from "../entities";
import { WishlistOptionRo } from "../interfaces";
import { WishlistOptionDto } from "../dto";

@Injectable()
export class WishlistOptionService {
  constructor(protected readonly _em: EntityManager) {}

  public async createWishlistOption(
    em: EntityManager,
    wishlistOptionDto: WishlistOptionDto,
    wishlist: Wishlist,
  ): Promise<WishlistOption> {
    const wishlistOption = new WishlistOption(wishlistOptionDto.text, wishlist);

    em.persist(wishlistOption);

    return wishlistOption;
  }

  public async buildWishlistOptionRo(em: EntityManager, wishlistOption: WishlistOption): Promise<WishlistOptionRo> {
    await em.populate(wishlistOption, []);

    return {
      optionId: wishlistOption.id,
      text: wishlistOption.text,
      wishlistId: wishlistOption.wishlist.id,
    };
  }
}
