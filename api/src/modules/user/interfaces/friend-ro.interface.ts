import { UserRo } from "./user-ro.interface";

export interface FriendRoOptions {
  readonly showWhoseFriend?: boolean;
}

export interface FriendRo {
  readonly user: UserRo;
  readonly to?: UserRo;
}
