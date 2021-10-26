import { IUserRo } from "../../user/interfaces";
import { IWishlistOptionRo } from "./wishlist-option-ro.interface";

export interface IWishlistRo {
  readonly wishlistId: number;
  readonly user: IUserRo;
  readonly description?: string | null;
  readonly options: ReadonlyArray<IWishlistOptionRo>;
}
