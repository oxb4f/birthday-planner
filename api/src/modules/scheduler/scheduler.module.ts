import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import * as schedulerServices from "./services";
import { SharedModule } from "../shared/shared.module";
import { FriendsBirthdayProcessor } from "../mq/processors";
import { BullQueue } from "../mq/constants/enum";
import { UserModule } from "../user/user.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    SharedModule,
    UserModule,
    NotificationModule,
    MikroOrmModule.forFeature([]),
    BullModule.registerQueue({
      name: BullQueue.FRIENDS_BIRTHDAY_PROCESSING_QUEUE,
    }),
  ],
  providers: [...Object.values(schedulerServices), FriendsBirthdayProcessor],
  exports: Object.values(schedulerServices),
})
export class SchedulerModule {}
