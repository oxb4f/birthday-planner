import { Entity, Enum, ManyToOne } from "mikro-orm";

import { User } from "../../user/entities";
import { Room } from "./room.entity";
import { BaseEntity } from "../../shared/entities";
import { Role } from "../constants/enum";

@Entity()
export class RoomParticipant extends BaseEntity {
  @Enum({ items: () => Role, array: true, default: [Role.PARTICIPANT] })
  public readonly roles: Array<Role> = [Role.PARTICIPANT];

  @ManyToOne({ onDelete: "cascade" })
  public readonly user!: User;

  @ManyToOne({ onDelete: "cascade" })
  public readonly room!: Room;

  constructor(user: User, room: Room) {
    super();

    this.user = user;
    this.room = room;
  }
}
