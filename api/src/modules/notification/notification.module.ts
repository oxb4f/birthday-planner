import { forwardRef, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

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
  providers: Object.values(notificationServices),
  exports: Object.values(notificationServices),
})
export class NotificationModule {}
