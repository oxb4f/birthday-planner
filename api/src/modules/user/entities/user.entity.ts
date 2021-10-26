import { Entity, Property } from "mikro-orm";
import * as crypto from "crypto";

import { BaseEntity } from "../../shared/entities";

@Entity()
export class User extends BaseEntity {
  @Property({ unique: true })
  public readonly username: string;

  @Property()
  public readonly password: string;

  @Property()
  public readonly birthdayDate: string;

  @Property({ nullable: true })
  public readonly firstName?: string | null = null;

  @Property({ nullable: true })
  public readonly lastName?: string | null = null;

  constructor(username: string, password: string, birthdayDate: string, firstName?: string, lastName?: string) {
    super();

    this.username = username;
    this.password = User.passwordHash(password);
    this.birthdayDate = birthdayDate;

    if (firstName !== undefined) {
      this.firstName = firstName;
    }
    if (lastName !== undefined) {
      this.lastName = lastName;
    }
  }

  public static passwordHash(password: string): string {
    return crypto.createHmac("sha256", password).digest("hex");
  }
}
