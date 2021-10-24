import { Entity, ManyToOne, PrimaryKey, Property } from "mikro-orm";

import { User } from "../../user/entities";

@Entity()
export class RefreshToken {
  @PrimaryKey()
  public readonly id: number;

  @Property()
  public readonly payload: string;

  @Property()
  public readonly expiresAt: number;

  @ManyToOne({ onDelete: "cascade" })
  public readonly user: User;

  constructor(payload: string, expirationTime: number, user: User) {
    this.payload = payload;
    this.expiresAt = Math.floor(Date.now() / 1000) + expirationTime;
    this.user = user;
  }
}
