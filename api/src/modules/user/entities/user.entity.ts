import { Entity, PrimaryKey, Property } from "mikro-orm";
import * as crypto from "crypto";

@Entity()
export class User {
  @PrimaryKey()
  public readonly id: number;

  @Property({ unique: true })
  public readonly username: string;

  @Property()
  public readonly password: string;

  @Property({ nullable: true })
  public readonly firstName?: string | null = null;

  @Property({ nullable: true })
  public readonly lastName?: string | null = null;

  @Property()
  public readonly createdAt: number = Math.floor(Date.now() / 1000);

  @Property({ onUpdate: () => Math.floor(Date.now() / 1000) })
  public readonly updatedAt: number = Math.floor(Date.now() / 1000);

  constructor(username: string, password: string, firstName?: string, lastName?: string) {
    this.username = username;
    this.password = User.passwordHash(password);

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
