import { UserRo } from "./user-ro.interface";
import { FriendRequestStatus } from "../constants/enums";

export interface FriendRequestRoOptions {
  readonly showFriendRequestWasSentTo?: boolean;
}

export interface FriendRequestRo {
  readonly friendRequestId: number;
  readonly status: FriendRequestStatus;
  readonly from: UserRo;
  readonly to?: UserRo;
}
