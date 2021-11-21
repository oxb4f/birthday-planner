import { HttpStatus } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { from, defer, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { extension } from "mime-types";
import { randomBytes } from "crypto";
import { Response } from "express";

import { S3BucketConfig, DownloadFileOptions } from "../interfaces";

export abstract class FileService {
  protected constructor(
    protected readonly _s3: S3,
    protected readonly _s3Config: Array<S3BucketConfig>,
  ) {}

  protected _initBuckets(buckets: Array<S3BucketConfig>): void {
    defer(() => this._s3.listBuckets().promise()).subscribe(
      (existingBuckets) => {
        from(buckets)
          .pipe(
            filter(
              (bucket) =>
                !existingBuckets.Buckets?.find(
                  (_bucket) => bucket.name === _bucket.Name,
                ),
            ),
            map((bucket) => {
              defer(() =>
                this._s3.createBucket({ Bucket: bucket.name }).promise(),
              ).subscribe(() => {
                from(bucket.policies).pipe(
                  map((policy) =>
                    defer(() =>
                      this._s3
                        .putBucketPolicy({
                          Bucket: bucket.name,
                          Policy: policy,
                        })
                        .promise(),
                    ).subscribe(),
                  ),
                );
              });
            }),
          )
          .subscribe();
      },
    );
  }

  public uploadFiles(
    bucket: string,
    files: Array<Express.Multer.File>,
  ): Observable<string> {
    return from(files).pipe(
      map((file) => {
        const key =
          "files/" +
          randomBytes(16).toString("hex") +
          `.${extension(file.mimetype)}`;
        const endpoint = `${bucket}/${key}`;

        defer(() =>
          this._s3
            .putObject({
              Bucket: bucket,
              Body: file.buffer,
              ACL: "public-read",
              Key: key,
            })
            .promise(),
        ).subscribe();

        return endpoint;
      }),
    );
  }

  public downloadFile(
    bucket: string,
    key: string,
    res: Response,
    opts?: DownloadFileOptions,
  ): void {
    const s3RequestParams: S3.HeadObjectRequest = { Bucket: bucket, Key: key };
    if (opts?.range) {
      s3RequestParams.Range = opts.range;
    }

    defer(() => this._s3.headObject(s3RequestParams).promise()).subscribe({
      next: () => {
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
      },
      error: () => {
        res.json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Bad file id",
        });
      },
    });
  }
}
