import { Entity, Enum } from "mikro-orm";
import { BaseEntity } from "../../shared/entities";
import { NotificationType } from "../constants/enums";

@Entity({
  discriminatorColumn: "type",
  discriminatorValue: "notification",
})
export class Notification extends BaseEntity {
  @Enum()
  public readonly type: NotificationType;

  constructor(type: NotificationType) {
    super();

    this.type = type;
  }
}
