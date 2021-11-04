import { UserRo } from "../../user/interfaces";
import { NotificationType } from "../constants/enums";

export interface NotificationRo {
  readonly notificationId: number;
  readonly to: UserRo;
  readonly type: NotificationType;
  readonly createdAt: number;
}
