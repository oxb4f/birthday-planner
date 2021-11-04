import { Entity, Index, ManyToOne, Unique } from "mikro-orm";

import { BaseEntity } from "../../shared/entities";
import { User } from "./user.entity";

@Entity()
@Unique({ properties: ["user", "to"] })
export class Friend extends BaseEntity {
  @Index({ name: "friend_to_id_index" })
  @ManyToOne()
  public readonly to: User;

  @Index({ name: "friend_user_id_index" })
  @ManyToOne()
  public readonly user: User;

  constructor(user: User, to: User) {
    super();

    this.user = user;
    this.to = to;
  }
}
