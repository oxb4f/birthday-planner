import { Module } from "@nestjs/common";

import * as schedulerServices from "./services";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [SharedModule],
  providers: Object.values(schedulerServices),
  exports: Object.values(schedulerServices),
})
export class SchedulerModule {}
