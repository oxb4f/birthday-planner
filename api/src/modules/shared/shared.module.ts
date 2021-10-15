import { Module } from "@nestjs/common";
import * as sharedServices from "./services";

@Module({
  providers: Object.values(sharedServices),
  exports: Object.values(sharedServices),
})
export class SharedModule {}
