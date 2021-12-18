import {
  Entity,
  Index,
  ManyToOne,
  Property,
  OneToMany,
  Collection,
  OneToOne,
} from "@mikro-orm/core";

import { User } from "../../user/entities";
import { BaseEntity } from "../../shared/entities";
import { RoomParticipant } from "./room-participant.entity";
import { RoomInvite } from "./room-invite.entity";

@Entity()
export class Room extends BaseEntity {
  @Property()
  public readonly title!: string;

  @Index({ name: "room_user_id_index" })
  @ManyToOne({ nullable: true })
  public readonly owner!: User | null;

  @OneToMany(() => RoomParticipant, (roomParticipant) => roomParticipant.room)
  public readonly participants = new Collection<RoomParticipant>(this);

  @OneToOne({ nullable: true })
  public readonly invite: RoomInvite | null = null;

  constructor(title: string, owner: User) {
    super();

    this.title = title;
    this.owner = owner;
  }
}
