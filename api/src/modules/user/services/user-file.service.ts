import { Injectable, OnModuleInit } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { InjectAwsService } from "nest-aws-sdk";

import { FileService } from "../../file/services";
import { s3Config } from "../constants/s3-config";

@Injectable()
export class UserFileService extends FileService implements OnModuleInit {
  constructor(@InjectAwsService(S3) s3: S3) {
    super(s3, s3Config);
  }

  public onModuleInit(): void {
    this._initBuckets(this._s3Config);
  }
}
