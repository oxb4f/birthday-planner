import { forwardRef, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import * as eventsGateways from "./events";
import * as notificationServices from "./services";
import * as notificationControllers from "./controllers";
import * as notificationEntities from "./entities";
import { SharedModule } from "../shared/shared.module";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    forwardRef(() => UserModule),
    SharedModule,
    AuthModule,
    MikroOrmModule.forFeature({ entities: Object.values(notificationEntities) }),
  ],
  controllers: Object.values(notificationControllers),
  providers: [...Object.values(notificationServices), ...Object.values(eventsGateways)],
  exports: [...Object.values(notificationServices), ...Object.values(eventsGateways)],
})
export class NotificationModule {}
