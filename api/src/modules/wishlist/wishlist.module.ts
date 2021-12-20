import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import * as wishlistEntities from "./entities";
import * as wishlistServices from "./services";
import * as wishlistControllers from "./controllers";
import { SharedModule } from "../shared/shared.module";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,

    MikroOrmModule.forFeature({ entities: Object.values(wishlistEntities) }),
  ],
  controllers: Object.values(wishlistControllers),
  providers: Object.values(wishlistServices),
  exports: Object.values(wishlistServices),
})
export class WishlistModule {}
