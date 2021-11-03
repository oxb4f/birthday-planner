import { Entity, ManyToOne } from "mikro-orm";

import { Notification } from "./notification.entity";
import { FriendRequest } from "../../user/entities";
import { NotificationType } from "../constants/enums";

@Entity({
  discriminatorValue: NotificationType.INCOMING_FRIEND_REQUEST_NOTIFICATION,
})
export class IncomingFriendRequestNotification extends Notification {
  @ManyToOne()
  public readonly friendRequest: FriendRequest;

  constructor(friendRequest: FriendRequest) {
    super(NotificationType.INCOMING_FRIEND_REQUEST_NOTIFICATION);

    this.friendRequest = friendRequest;
  }
}
