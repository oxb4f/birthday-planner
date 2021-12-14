import { nanoid } from "nanoid";
import { Entity, OneToOne, Property } from "mikro-orm";

import { BaseEntity } from "../../shared/entities";
import { Room } from "./room.entity";

@Entity()
export class RoomInvite extends BaseEntity {
  @Property()
  public readonly token!: string;

  @OneToOne()
  public readonly room!: Room;

  constructor(room: Room) {
    super();

    this.room = room;
    this.token = RoomInvite.generateToken();
  }

  public static generateToken(): string {
    return nanoid(20);
  }
}
