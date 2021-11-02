import { FriendRequestStatus } from "../constants/enums";
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangeFriendRequestStatusDto {
  @ApiProperty({ enum: FriendRequestStatus })
  @IsEnum(FriendRequestStatus)
  public readonly newStatus: FriendRequestStatus;
}
