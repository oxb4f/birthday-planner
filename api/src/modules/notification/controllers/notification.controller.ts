import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

import { GetUserFromRequest } from "../../user/decorators";
import { User } from "../../user/entities";
import { PaginationDto } from "../../shared/dto";
import {
  ChangedFriendRequestStatusNotificationRo,
  FriendBirthdayNotificationRo,
  IncomingFriendRequestNotificationRo,
  NotificationRo,
} from "../interfaces";
import { NotificationService } from "../services";
import { NotificationType } from "../constants/enums";
import {
  ChangedFriendRequestStatusNotification,
  FriendBirthdayNotification,
  IncomingFriendRequestNotification,
} from "../entities";

@ApiTags("notification")
@Controller()
export class NotificationController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _notificationService: NotificationService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get("/notifications")
  public async getNotifications(
    @GetUserFromRequest() user: User,
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
  ): Promise<
    Array<
      | ChangedFriendRequestStatusNotificationRo
      | FriendBirthdayNotificationRo
      | IncomingFriendRequestNotificationRo
      | NotificationRo
    >
  > {
    const notifications =
      await this._notificationService.getNotificationsByUserId(
        this._em,
        user.id,
        paginationDto,
      );

    return Promise.all(
      notifications.map(async (notification) => {
        switch (notification.type) {
          case NotificationType.CHANGED_FRIEND_REQUEST_STATUS_NOTIFICATION:
            return this._notificationService.buildChangedFriendRequestStatusNotificationRo(
              this._em,
              notification as ChangedFriendRequestStatusNotification,
            );
          case NotificationType.FRIEND_BIRTHDAY_NOTIFICATION:
            return this._notificationService.buildFriendBirthdayNotificationRo(
              this._em,
              notification as FriendBirthdayNotification,
            );
          case NotificationType.INCOMING_FRIEND_REQUEST_NOTIFICATION:
            return this._notificationService.buildIncomingFriendRequestNotificationRo(
              this._em,
              notification as IncomingFriendRequestNotification,
            );
          default:
            return this._notificationService.buildNotificationRo(
              this._em,
              notification,
            );
        }
      }),
    );
  }
}
