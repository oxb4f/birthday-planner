import { Module } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { AwsSdkModule } from "nest-aws-sdk";

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  // exports: Object.values(fileServices),
})
export class FileModule {}
