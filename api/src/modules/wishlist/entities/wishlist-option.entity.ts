import { Entity, ManyToOne, Property } from "mikro-orm";

import { BaseEntity } from "../../shared/entities";
import { Wishlist } from "./wishlist.entity";

@Entity()
export class WishlistOption extends BaseEntity {
  @Property()
  public readonly text: string;

  @ManyToOne({ onDelete: "cascade" })
  public readonly wishlist: Wishlist;

  constructor(text: string, wishlist: Wishlist) {
    super();

    this.text = text;
    this.wishlist = wishlist;
  }
}
