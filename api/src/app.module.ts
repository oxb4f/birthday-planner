import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { AppController } from "./app.controller";
import { SharedModule } from "./modules/shared/shared.module";

@Module({
  imports: [MikroOrmModule.forRoot(), SharedModule],
  controllers: [AppController],
})
export class AppModule {}
