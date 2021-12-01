import { Entity, Index, ManyToOne, Property } from "@mikro-orm/core";
import { User } from "../../user/entities";
import { BaseEntity } from "../../shared/entities";

@Entity()
export class Room extends BaseEntity {
  @Property()
  public readonly title!: string;

  @Index({ name: "room_user_id_index" })
  @ManyToOne()
  public readonly owner!: User;

  constructor(title: string, owner: User) {
    super();

    this.title = title;
    this.owner = owner;
  }
}
