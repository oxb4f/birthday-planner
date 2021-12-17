import { UserRo } from "../../user/interfaces";
import { RoomRo } from "./room-ro.interface";
import { Role } from "../constants/enum";

export interface RoomParticipantRoOptions {
  readonly showRoom?: boolean;
}

export interface RoomParticipantRo {
  readonly roomParticipantId: number;
  readonly role: Role;
  readonly user: UserRo;
  readonly room?: RoomRo;
}
