import { Entity, Index, ManyToOne, Property } from "mikro-orm";
import { BaseEntity } from "../../shared/entities";

import { User } from "../../user/entities";

@Entity()
export class RefreshToken extends BaseEntity {
  @Property()
  public readonly payload: string;

  @Property()
  public readonly expiresAt: number;

  @Index({ name: "refresh_token_userId_index" })
  @ManyToOne({ onDelete: "cascade" })
  public readonly user: User;

  constructor(payload: string, expirationTime: number, user: User) {
    super();

    this.payload = payload;
    this.expiresAt = Math.floor(Date.now() / 1000) + expirationTime;
    this.user = user;
  }
}
