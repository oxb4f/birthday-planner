import { Entity, ManyToOne } from "mikro-orm";

import { Notification } from "./notification.entity";
import { User } from "../../user/entities";
import { NotificationType } from "../constants/enums";

@Entity({
  discriminatorValue: NotificationType.FRIEND_BIRTHDAY_NOTIFICATION,
})
export class FriendBirthdayNotification extends Notification {
  @ManyToOne()
  public readonly user: User;

  constructor(user: User) {
    super(NotificationType.FRIEND_BIRTHDAY_NOTIFICATION);

    this.user = user;
  }
}
