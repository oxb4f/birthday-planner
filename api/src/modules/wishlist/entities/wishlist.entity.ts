import { Collection, Entity, Index, ManyToOne, OneToMany, Property } from "mikro-orm";

import { BaseEntity } from "../../shared/entities";
import { User } from "../../user/entities";
import { WishlistOption } from "./wishlist-option.entity";

@Entity()
export class Wishlist extends BaseEntity {
  @Property({ nullable: true })
  public readonly description: string | null = null;

  @Index({ name: "wishlist_userId_index" })
  @ManyToOne({ onDelete: "cascade" })
  public readonly user: User;

  @OneToMany(() => WishlistOption, (wishlistOption) => wishlistOption.wishlist)
  public readonly options = new Collection<WishlistOption>(this);

  constructor(user: User, description?: string) {
    super();

    this.user = user;

    this.description = description ?? this.description;
  }
}
