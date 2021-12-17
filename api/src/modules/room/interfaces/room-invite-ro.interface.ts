import { Room } from "../entities";

export interface RoomInviteRoOptions {
  readonly showRoom?: boolean;
}

export interface RoomInviteRo {
  readonly roomInviteId: number;
  readonly token: string;
  readonly room?: Room;
}
