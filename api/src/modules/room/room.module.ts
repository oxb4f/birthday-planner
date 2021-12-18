import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import * as roomControllers from "./controllers";
import * as roomServices from "./services";
import * as roomEntities from "./entities";
import { RolesGuard } from "./guards";
import { AuthModule } from "../auth/auth.module";
import { SharedModule } from "../shared/shared.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,

    MikroOrmModule.forFeature({ entities: Object.values(roomEntities) }),
  ],
  controllers: Object.values(roomControllers),
  providers: [...Object.values(roomServices), RolesGuard],
  exports: Object.values(roomServices),
})
export class RoomModule {}
