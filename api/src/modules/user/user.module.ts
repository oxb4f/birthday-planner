import { forwardRef, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import * as userServices from "./services";
import * as userControllers from "./controllers";
import * as userEntities from "./entities";
import { SharedModule } from "../shared/shared.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    forwardRef(() => NotificationModule),
    SharedModule,
    AuthModule,
    MikroOrmModule.forFeature({ entities: Object.values(userEntities) }),
  ],
  controllers: Object.values(userControllers),
  providers: Object.values(userServices),
  exports: Object.values(userServices),
})
export class UserModule {}
