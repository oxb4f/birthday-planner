import { UserRo } from "../../user/interfaces";
import { RoomRo } from "./room-ro.interface";
import { Role } from "../constants/enum";

export interface RoomParticipantRoOptions {
  readonly showRoom?: boolean;
}

export interface RoomParticipantRo {
  readonly roomParticipantId: number;
  readonly roles: Array<Role>;
  readonly user: UserRo;
  readonly room?: RoomRo;
}
