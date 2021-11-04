import { Entity, Enum, Index, ManyToOne, Unique } from "mikro-orm";

import { BaseEntity } from "../../shared/entities";
import { User } from "./user.entity";
import { FriendRequestStatus } from "../constants/enums";

@Entity()
@Unique({ properties: ["from", "to"] })
export class FriendRequest extends BaseEntity {
  @Index({ name: "friend_request_from_id_index" })
  @ManyToOne()
  public readonly from: User;

  @Index({ name: "friend_request_to_id_index" })
  @ManyToOne()
  public readonly to: User;

  @Enum()
  @Index({ name: "status_index" })
  public status: FriendRequestStatus = FriendRequestStatus.PENDING;

  constructor(from: User, to: User) {
    super();

    this.from = from;
    this.to = to;
  }
}
