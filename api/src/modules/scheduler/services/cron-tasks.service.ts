import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EntityManager } from "@mikro-orm/postgresql";

import { RefreshToken } from "../../auth/entities";

@Injectable()
export class CronTasksService {
  constructor(
    protected readonly _em: EntityManager,
    @InjectPinoLogger(CronTasksService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async deleteExpiredRefreshTokens(): Promise<void> {
    this._logger.debug("Cron: started deleteExpiredRefreshTokens task");

    const now = Math.floor(Date.now() / 1000);

    const expiredRefreshTokens = await this._em.find(RefreshToken, { expiresAt: { $lte: now } }, { limit: 100 });

    await this._em.removeAndFlush(expiredRefreshTokens);

    this._logger.debug(
      `Cron: finished deleteExpiredRefreshTokens task. Number of deleted entities: ${expiredRefreshTokens.length}`,
    );
  }
}
