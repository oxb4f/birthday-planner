import { S3 } from "aws-sdk";
import { extension } from "mime-types";
import { randomBytes } from "crypto";
import { PinoLogger } from "nestjs-pino";
import type { Response } from "express";

import { S3BucketConfig, DownloadFileOptions } from "../interfaces";

export abstract class FileService {
  protected constructor(
    protected readonly _s3: S3,
    protected readonly _s3Config: Array<S3BucketConfig>,
    protected readonly _logger: PinoLogger,
  ) {}

  protected async _initBuckets(buckets: Array<S3BucketConfig>): Promise<void> {
    const existingBuckets = (await this._s3.listBuckets().promise()).Buckets;

    await Promise.all(
      buckets
        ?.filter(
          (bucket) =>
            !existingBuckets?.find((_bucket) => bucket.name === _bucket.Name),
        )
        .map(async (bucket) => {
          await this._s3.createBucket({ Bucket: bucket.name }).promise();

          return Promise.all(
            bucket.policies.map((policy) =>
              this._s3
                .putBucketPolicy({
                  Bucket: bucket.name,
                  Policy: policy,
                })
                .promise(),
            ),
          );
        }),
    );
  }

  public uploadFiles(
    bucket: string,
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    return Promise.all(
      files.map(async (file) => {
        const key =
          "files/" +
          randomBytes(16).toString("hex") +
          `.${extension(file.mimetype)}`;
        const endpoint = `${bucket}/${key}`;

        this._s3
          .putObject({
            Bucket: bucket,
            Body: file.buffer,
            ACL: "public-read",
            Key: key,
          })
          .promise()
          .catch(this._logger.error.bind(this._logger));

        return endpoint;
      }),
    );
  }

  public downloadFile(
    bucket: string,
    key: string,
    res: Response,
    opts?: DownloadFileOptions,
  ): Promise<void> {
    const s3RequestParams: S3.HeadObjectRequest = { Bucket: bucket, Key: key };
    if (opts?.range) {
      s3RequestParams.Range = opts.range;
    }

    return this._s3
      .headObject(s3RequestParams)
      .promise()
      .then(() => {
        const s3Request = this._s3.getObject(s3RequestParams);

        s3Request.on("httpHeaders", (statusCode, headers) => {
          res.status(statusCode);

          Object.keys(headers).forEach((key) => {
            res.set(key, headers[key]);
          });

          if (opts?.mimeType) {
            res.set("Content-Type", opts.mimeType);
          }
        });

        s3Request.createReadStream().pipe(res);
      });
  }
}
