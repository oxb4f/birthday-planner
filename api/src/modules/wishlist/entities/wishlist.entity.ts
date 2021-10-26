import { Collection, Entity, ManyToOne, OneToMany, Property } from "mikro-orm";

import { BaseEntity } from "../../shared/entities";
import { User } from "../../user/entities";
import { WishlistOption } from "./wishlist-option.entity";

@Entity()
export class Wishlist extends BaseEntity {
  @Property({ nullable: true })
  public readonly description: string | null = null;

  @ManyToOne()
  public readonly user: User;

  @OneToMany(() => WishlistOption, (wishlistOption) => wishlistOption.wishlist)
  public readonly options = new Collection<WishlistOption>(this);

  constructor(user: User, description?: string) {
    super();

    this.user = user;

    if (description !== undefined) {
      this.description = description;
    }
  }
}
