import { UserRo } from "../../user/interfaces";

export interface RoomRo {
  readonly roomId: number;
  readonly title: string;
  readonly owner: UserRo;
  readonly createdAt: number;
}
