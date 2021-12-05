import { NotificationRo } from "./notification-ro.interface";
import { UserRo } from "../../user/interfaces";

export interface FriendBirthdayNotificationRoOptions {
  readonly howMuchIsLeft?: number;
}

export interface FriendBirthdayNotificationRo extends NotificationRo {
  readonly howMuchIsLeft?: number;
  readonly user: UserRo;
}
