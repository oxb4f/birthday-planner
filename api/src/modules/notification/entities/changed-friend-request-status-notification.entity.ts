import { Entity, ManyToOne } from "mikro-orm";

import { Notification } from "./notification.entity";
import { FriendRequest, User } from "../../user/entities";
import { NotificationType } from "../constants/enums";

@Entity({
  discriminatorValue:
    NotificationType.CHANGED_FRIEND_REQUEST_STATUS_NOTIFICATION,
})
export class ChangedFriendRequestStatusNotification extends Notification {
  @ManyToOne({ onDelete: "cascade" })
  public readonly friendRequest: FriendRequest;

  constructor(friendRequest: FriendRequest, to: User) {
    super(NotificationType.CHANGED_FRIEND_REQUEST_STATUS_NOTIFICATION, to);

    this.friendRequest = friendRequest;
  }
}
