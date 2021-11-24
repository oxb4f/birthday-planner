import { wrap } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/knex";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { InjectAwsService } from "nest-aws-sdk";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { FileService } from "../../file/services";
import { S3Bucket } from "../constants/enums";
import { s3Config } from "../constants/s3-config";
import { User } from "../entities";

@Injectable()
export class UserFileService extends FileService implements OnModuleInit {
  constructor(
    @InjectAwsService(S3) s3: S3,
    @InjectPinoLogger(UserFileService.name) logger: PinoLogger,
    protected readonly _em: EntityManager,
  ) {
    super(s3, s3Config, logger);
  }

  public onModuleInit(): void {
    this._initBuckets(this._s3Config);
  }

  public async uploadUserAvatar(
    em: EntityManager,
    user: User,
    avatar: Express.Multer.File,
  ): Promise<User> {
    const [avatarEndpoint] = await this.uploadFiles(S3Bucket.PUBLIC, [avatar]);

    return wrap(user).assign(
      { avatar: avatarEndpoint },
      { mergeObjects: true, em },
    );
  }
}
