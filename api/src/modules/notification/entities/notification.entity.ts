import { Entity, Enum, ManyToOne } from "mikro-orm";

import { BaseEntity } from "../../shared/entities";
import { NotificationType } from "../constants/enums";
import { User } from "../../user/entities";

@Entity({
  discriminatorColumn: "type",
  discriminatorValue: "notification",
})
export class Notification extends BaseEntity {
  @Enum()
  public readonly type: NotificationType;

  @ManyToOne()
  public readonly to: User;

  constructor(type: NotificationType, to: User) {
    super();

    this.type = type;
    this.to = to;
  }
}
