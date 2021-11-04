import { NotificationRo } from "./notification-ro.interface";
import { FriendRequestRo } from "../../user/interfaces";

export interface ChangedFriendRequestStatusNotificationRo extends NotificationRo {
  readonly friendRequest: FriendRequestRo;
}
