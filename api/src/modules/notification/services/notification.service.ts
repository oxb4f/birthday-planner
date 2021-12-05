import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { FriendRequest, User } from "../../user/entities";
import {
  ChangedFriendRequestStatusNotification,
  FriendBirthdayNotification,
  IncomingFriendRequestNotification,
  Notification,
} from "../entities";
import { FriendRequestStatus } from "../../user/constants/enums";
import { PaginationDto } from "../../shared/dto";
import {
  ChangedFriendRequestStatusNotificationRo,
  FriendBirthdayNotificationRo,
  FriendBirthdayNotificationRoOptions,
  IncomingFriendRequestNotificationRo,
  NotificationRo,
} from "../interfaces";
import { FriendService, UserService } from "../../user/services";
import { NotificationType } from "../constants/enums";
import { NotificationEventsGateway } from "../events";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Mutable } from "../../shared/types";

@Injectable()
export class NotificationService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _userService: UserService,
    protected readonly _notificationEventsGateway: NotificationEventsGateway,
    @Inject(forwardRef(() => FriendService))
    protected readonly _friendService: FriendService,
    @InjectPinoLogger(NotificationService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async createChangedFriendRequestStatusNotification(
    em: EntityManager,
    friendRequest: FriendRequest,
    to: User,
  ): Promise<ChangedFriendRequestStatusNotification> {
    const changedFriendRequestStatusNotification =
      new ChangedFriendRequestStatusNotification(friendRequest, to);

    await em.persistAndFlush(changedFriendRequestStatusNotification);

    this._notificationEventsGateway
      .emitNewNotification(
        NotificationType.CHANGED_FRIEND_REQUEST_STATUS_NOTIFICATION,
        to.id,
        await this.buildChangedFriendRequestStatusNotificationRo(
          em,
          changedFriendRequestStatusNotification,
        ),
      )
      .catch(this._logger.error.bind(this._logger));

    return changedFriendRequestStatusNotification;
  }

  public async createIncomingFriendRequestNotification(
    em: EntityManager,
    friendRequest: FriendRequest,
    to: User,
  ): Promise<IncomingFriendRequestNotification> {
    const incomingFriendRequestNotification =
      new IncomingFriendRequestNotification(friendRequest, to);

    await em.persistAndFlush(incomingFriendRequestNotification);

    this._notificationEventsGateway
      .emitNewNotification(
        NotificationType.INCOMING_FRIEND_REQUEST_NOTIFICATION,
        to.id,
        await this.buildChangedFriendRequestStatusNotificationRo(
          em,
          incomingFriendRequestNotification,
        ),
      )
      .catch(this._logger.error.bind(this._logger));

    return incomingFriendRequestNotification;
  }

  public async createFriendBirthdayNotification(
    em: EntityManager,
    user: User,
    to: User,
  ): Promise<FriendBirthdayNotification> {
    const friendBirthdayNotification = new FriendBirthdayNotification(user, to);

    em.persist(friendBirthdayNotification);

    return friendBirthdayNotification;
  }

  public async getNotificationsByUserId(
    em: EntityManager,
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<Notification[]> {
    const [offset, limit] = [
      paginationDto?.offset ?? 0,
      paginationDto?.limit ?? 15,
    ];

    const notificationsQuery = em
      .createQueryBuilder(Notification, "n")
      .select("n.*")
      .leftJoinAndSelect("friendRequest", "fr")
      .leftJoinAndSelect("to", "t")
      .leftJoinAndSelect("user", "u")
      .where({ to: userId })
      .andWhere({
        $and: [
          { "fr.id": { $ne: null } },
          {
            $or: [
              {
                "n.type": NotificationType.INCOMING_FRIEND_REQUEST_NOTIFICATION,
                "fr.status": FriendRequestStatus.PENDING,
              },
              {
                "n.type":
                  NotificationType.CHANGED_FRIEND_REQUEST_STATUS_NOTIFICATION,
                "fr.status": {
                  $in: [
                    FriendRequestStatus.ACCEPTED,
                    FriendRequestStatus.REJECTED,
                  ],
                },
              },
            ],
          },
        ],
      })
      .orderBy({ "n.createdAt": "DESC" })
      .offset(offset)
      .limit(limit);

    return notificationsQuery.getResult();
  }

  public async buildNotificationRo(
    em: EntityManager,
    notification: Notification,
  ): Promise<NotificationRo> {
    await em.populate(notification, ["to"]);

    return {
      notificationId: notification.id,
      to: await this._userService.buildUserRo(em, notification.to),
      type: notification.type,
      createdAt: notification.createdAt,
    } as NotificationRo;
  }

  public async buildChangedFriendRequestStatusNotificationRo(
    em: EntityManager,
    changedFriendRequestStatusNotification: ChangedFriendRequestStatusNotification,
  ): Promise<ChangedFriendRequestStatusNotificationRo> {
    await em.populate(changedFriendRequestStatusNotification, [
      "friendRequest",
      "to",
    ]);

    return {
      ...(await this.buildNotificationRo(
        em,
        changedFriendRequestStatusNotification,
      )),

      friendRequest: await this._friendService.buildFriendRequestRo(
        em,
        changedFriendRequestStatusNotification.friendRequest,
        { showFriendRequestWasSentTo: true },
      ),
    } as ChangedFriendRequestStatusNotificationRo;
  }

  public async buildIncomingFriendRequestNotificationRo(
    em: EntityManager,
    incomingFriendRequestNotification: IncomingFriendRequestNotification,
  ): Promise<IncomingFriendRequestNotificationRo> {
    await em.populate(incomingFriendRequestNotification, [
      "friendRequest",
      "to",
    ]);

    return {
      ...(await this.buildNotificationRo(
        em,
        incomingFriendRequestNotification,
      )),

      friendRequest: await this._friendService.buildFriendRequestRo(
        em,
        incomingFriendRequestNotification.friendRequest,
      ),
    } as IncomingFriendRequestNotificationRo;
  }

  public async buildFriendBirthdayNotificationRo(
    em: EntityManager,
    friendBirthdayNotification: FriendBirthdayNotification,
    friendBirthdayNotificationRoOptions?: FriendBirthdayNotificationRoOptions,
  ): Promise<FriendBirthdayNotificationRo> {
    await em.populate(friendBirthdayNotification, ["user", "to"]);

    const friendBirthdayNotificationRo = {
      ...(await this.buildNotificationRo(em, friendBirthdayNotification)),

      user: await this._userService.buildUserRo(
        em,
        friendBirthdayNotification.user,
      ),
    } as Mutable<FriendBirthdayNotificationRo>;

    if (friendBirthdayNotificationRoOptions?.howMuchIsLeft) {
      friendBirthdayNotificationRo.howMuchIsLeft =
        friendBirthdayNotificationRoOptions.howMuchIsLeft;
    }

    return friendBirthdayNotificationRo;
  }
}
