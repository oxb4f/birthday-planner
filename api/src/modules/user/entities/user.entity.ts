import { Collection, Entity, Index, OneToMany, Property } from "mikro-orm";
import * as crypto from "crypto";

import { BaseEntity } from "../../shared/entities";
import { Wishlist } from "../../wishlist/entities";

@Entity()
export class User extends BaseEntity {
  @Index({ name: "user_username_index" })
  @Property({ unique: true, nullable: true })
  public readonly username: string | null;

  @Property({ nullable: true })
  public readonly password: string | null;

  @Index({ name: "user_email_index" })
  @Property({ unique: true })
  public readonly email: string;

  @Property({ nullable: true })
  public readonly avatar: string | null = null;

  @Property()
  public readonly registeredUsingGoogle: boolean;

  @Property({ nullable: true })
  public readonly birthdayDate: number | null;

  @Property({ nullable: true })
  public readonly firstName: string | null;

  @Property({ nullable: true })
  public readonly lastName: string | null;

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  public readonly wishlists = new Collection<Wishlist>(this);

  constructor(
    email: string,
    registeredUsingGoogle = false,
    username: string | null = null,
    password: string | null = null,
    birthdayDate: number | null = null,
    firstName: string | null = null,
    lastName: string | null = null,
  ) {
    super();

    this.email = email;
    this.username = username;
    this.password = password ? User.passwordHash(password) : null;
    this.birthdayDate = birthdayDate;
    this.registeredUsingGoogle = registeredUsingGoogle;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public static passwordHash(password: string): string {
    return crypto.createHmac("sha256", password).digest("hex");
  }
}
