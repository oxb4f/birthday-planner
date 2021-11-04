import { NotificationRo } from "./notification-ro.interface";
import { UserRo } from "../../user/interfaces";

export interface FriendBirthdayNotificationRo extends NotificationRo {
  readonly user: UserRo;
}
