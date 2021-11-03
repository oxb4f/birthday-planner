import { Entity, ManyToOne } from "mikro-orm";

import { Notification } from "./notification.entity";
import { FriendRequest } from "../../user/entities";
import { NotificationType } from "../constants/enums";

@Entity({
  discriminatorValue: NotificationType.CHANGED_FRIEND_REQUEST_STATUS_NOTIFICATION,
})
export class ChangedFriendRequestStatusNotification extends Notification {
  @ManyToOne()
  public readonly friendRequest: FriendRequest;

  constructor(friendRequest: FriendRequest) {
    super(NotificationType.CHANGED_FRIEND_REQUEST_STATUS_NOTIFICATION);

    this.friendRequest = friendRequest;
  }
}
