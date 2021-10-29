import { UserRo } from "../../user/interfaces";
import { WishlistOptionRo } from "./wishlist-option-ro.interface";

export interface WishlistRo {
  readonly wishlistId: number;
  readonly user: UserRo;
  readonly description?: string | null;
  readonly options: ReadonlyArray<WishlistOptionRo>;
}
