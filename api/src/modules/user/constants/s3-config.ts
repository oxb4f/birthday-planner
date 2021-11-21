import { S3BucketConfig } from "../../file/interfaces";
import { S3Bucket } from "./enums";

export const s3Config: Array<S3BucketConfig> = [
  {
    name: S3Bucket.PUBLIC,
    policies: [
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicRead",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject", "s3:GetObjectVersion"],
            Resource: [`arn:aws:s3:::${S3Bucket.PUBLIC}/*`],
          },
        ],
      }),
    ],
  },
];
