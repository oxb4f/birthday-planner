import { forwardRef, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { S3 } from "aws-sdk";
import { AwsSdkModule } from "nest-aws-sdk";

import * as userServices from "./services";
import * as userControllers from "./controllers";
import * as userEntities from "./entities";
import { SharedModule } from "../shared/shared.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    AwsSdkModule.forFeatures([S3]),
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
