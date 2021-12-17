import { Entity, Enum, ManyToOne } from "mikro-orm";

import { User } from "../../user/entities";
import { Room } from "./room.entity";
import { BaseEntity } from "../../shared/entities";
import { Role } from "../constants/enum";

@Entity()
export class RoomParticipant extends BaseEntity {
  @Enum(() => Role)
  public readonly role!: Role;

  @ManyToOne()
  public readonly user!: User;

  @ManyToOne()
  public readonly room!: Room;

  constructor(user: User, room: Room, role = Role.PARTICIPANT) {
    super();

    this.user = user;
    this.room = room;
    this.role = role;
  }
}
