import { EntityManager } from "@mikro-orm/postgresql";
import { MikroORM } from "@mikro-orm/core";
import { UseRequestContext } from "@mikro-orm/nestjs";
import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { BullQueue, MqMessage } from "../constants/enum";
import { FriendsBirthdayProcessorPayload } from "../interfaces";
import { FriendService, UserService } from "../../user/services";
import { NotificationEventsGateway } from "../../notification/events";
import { NotificationType } from "../../notification/constants/enums";
import { NotificationService } from "../../notification/services";

@Processor(BullQueue.FRIENDS_BIRTHDAY_PROCESSING_QUEUE)
export class FriendsBirthdayProcessor {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly orm: MikroORM,
    @InjectPinoLogger(FriendsBirthdayProcessor.name)
    protected readonly _logger: PinoLogger,
    protected readonly _friendService: FriendService,
    protected readonly _notificationEventGateway: NotificationEventsGateway,
    protected readonly _notificationService: NotificationService,
    protected readonly _userService: UserService,
  ) {}

  @Process(MqMessage.START_FRIENDS_BIRTHDAY_PROCESSING)
  @UseRequestContext()
  public async friendsBirthdayProcessing(
    // optimize
    job: Job<FriendsBirthdayProcessorPayload>,
  ) {
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const oneDay = 1 * 24 * 60 * 60 * 1000;

    const { userId } = job.data;

    const user = await this._userService.getUser(this._em, { id: userId });

    const userFriends = await this._friendService.getUserFriendsByUserId(
      this._em,
      userId,
    );

    this._logger.info(userFriends);

    const now = Date.now();

    for (const userFriend of userFriends) {
      if (!userFriend.user.birthdayDate) {
        continue;
      }

      const birthdayDate = new Date(userFriend.user.birthdayDate * 1000);
      const afterThreeDays = new Date(now + threeDays);
      const afterOneDay = new Date(now + oneDay);

      if (
        birthdayDate.getDay() === afterThreeDays.getDay() ||
        birthdayDate.getDay() === afterOneDay.getDay()
      ) {
        const notification =
          await this._notificationService.createFriendBirthdayNotification(
            this._em,
            userFriend.user,
            user,
          );

        await this._notificationEventGateway.emitNewNotification(
          NotificationType.FRIEND_BIRTHDAY_NOTIFICATION,
          userId,
          await this._notificationService.buildFriendBirthdayNotificationRo(
            this._em,
            notification,
          ),
        );

        await this._em.flush();
      }
    }
  }

  @OnQueueFailed()
  private async onFailed(job: Job<FriendsBirthdayProcessorPayload>, error: Error) {
    this._logger.error(error.message, error.stack)
  }
}
