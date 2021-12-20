import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { FriendRequestStatus } from "../constants/enums";

export class ChangeFriendRequestStatusDto {
  @ApiProperty({ enum: FriendRequestStatus })
  @IsEnum(FriendRequestStatus)
  public readonly newStatus!: FriendRequestStatus;
}
