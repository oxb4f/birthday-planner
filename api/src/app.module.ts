import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule, Params as PinoOptions } from "nestjs-pino";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { SharedModule } from "./modules/shared/shared.module";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { ConfigService } from "./modules/shared/services";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { NotificationModule } from "./modules/notification/notification.module";

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    WishlistModule,
    SchedulerModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    MikroOrmModule.forRoot(),
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
