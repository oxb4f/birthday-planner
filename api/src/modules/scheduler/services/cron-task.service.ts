import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EntityManager } from "@mikro-orm/postgresql";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

import { RefreshToken } from "../../auth/entities";
import { User } from "../../user/entities";
import { BullQueue, MqMessage } from "../../mq/constants/enum";
import { FriendsBirthdayProcessorPayload } from "../../mq/interfaces";

@Injectable()
export class CronTasksService {
  private _usersOffset = 0;
  private _usersLimit = 10;

  constructor(
    protected readonly _em: EntityManager,
    @InjectPinoLogger(CronTasksService.name)
    protected readonly _logger: PinoLogger,
    @InjectQueue(BullQueue.FRIENDS_BIRTHDAY_PROCESSING_QUEUE)
    protected readonly _friendsBirthdayProcessingQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async processFriendsBirthday(): Promise<void> {
    this._logger.debug("Cron: started processFriendsBirthday task");

    const users = await this._em
      .createQueryBuilder(User, "u")
      .select("u.id")
      .offset(this._usersOffset)
      .limit(this._usersLimit)
      .getResult();
    if (!users.length) {
      this._usersOffset = 0;
    } else {
      this._usersOffset += this._usersLimit;
    }

    for (const user of users) {
      await this._friendsBirthdayProcessingQueue.add(
        MqMessage.START_FRIENDS_BIRTHDAY_PROCESSING,
        { userId: user.id } as FriendsBirthdayProcessorPayload,
        {
          removeOnComplete: 100,
          attempts: 10,
          backoff: {
            delay: 80,
            type: "exponential",
          },
        },
      );
    }

    this._logger.debug("Cron: finished processFriendsBirthday task");
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async deleteExpiredRefreshTokens(): Promise<void> {
    this._logger.debug("Cron: started deleteExpiredRefreshTokens task");

    const now = Math.floor(Date.now() / 1000);

    const expiredRefreshTokens = await this._em.find(
      RefreshToken,
      { expiresAt: { $lte: now } },
      { limit: 100 },
    );

    await this._em.removeAndFlush(expiredRefreshTokens);

    this._logger.debug(
      `Cron: finished deleteExpiredRefreshTokens task. Number of deleted entities: ${expiredRefreshTokens.length}`,
    );
  }
}
