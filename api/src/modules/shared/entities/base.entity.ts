import { Entity, PrimaryKey, Property } from "mikro-orm";

@Entity({ abstract: true })
export abstract class BaseEntity {
  @PrimaryKey()
  public readonly id: number;

  @Property()
  public readonly createdAt: number = Math.floor(Date.now() / 1000);

  @Property({ onUpdate: () => Math.floor(Date.now() / 1000) })
  public readonly updatedAt: number = Math.floor(Date.now() / 1000);
}
