import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule, Params as PinoOptions } from "nestjs-pino";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import {
  AwsSdkModule,
  AwsServiceConfigurationOptionsFactory,
} from "nest-aws-sdk";
import { BullModule } from "@nestjs/bull";
import Bull from "bull";

import { SharedModule } from "./modules/shared/shared.module";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { ConfigService } from "./modules/shared/services";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { FileModule } from "./modules/file/file.module";
import { RoomModule } from "./modules/room/room.module";

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    WishlistModule,
    SchedulerModule,
    NotificationModule,
    FileModule,
    RoomModule,
    ScheduleModule.forRoot(),
    MikroOrmModule.forRoot(),
    BullModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<Bull.QueueOptions> => ({
        redis: {
          host: configService.get("REDIS_HOST"),
          port: configService.getNumber("REDIS_PORT"),
          db: configService.getNumber("REDIS_DB"),
          password: configService.get("REDIS_PASSWORD"),
        },
      }),
    }),
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        imports: [SharedModule],
        inject: [ConfigService],
        useFactory: (
          configService: ConfigService,
        ): AwsServiceConfigurationOptionsFactory => ({
          credentials: {
            accessKeyId: configService.get("MINIO_ACCESS_KEY"),
            secretAccessKey: configService.get("MINIO_SECRET_KEY"),
          },
          endpoint: configService.get("MINIO_ENDPOINT"),
          s3ForcePathStyle: true,
          signatureVersion: "v4",
        }),
      },
    }),
    LoggerModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<PinoOptions> => {
        return {
          pinoHttp: configService.isDevelopment()
            ? {
                level: "debug",
                prettyPrint: {
                  colorize: true,
                  leverFirst: true,
                  translateTime: "UTC:mm/dd/yyyy",
                },
              }
            : {},
        } as PinoOptions;
      },
    }),
  ],
})
export class AppModule {}
