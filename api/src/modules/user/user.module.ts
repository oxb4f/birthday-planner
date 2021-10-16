import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import * as userServices from "./services";
import * as userEntities from "./entities";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [MikroOrmModule.forFeature({ entities: Object.values(userEntities) }), SharedModule],
  providers: Object.values(userServices),
  exports: Object.values(userServices),
})
export class UserModule {}
