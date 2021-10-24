import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { AppController } from "./app.controller";
import { SharedModule } from "./modules/shared/shared.module";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { LoggerModule, Params as PinoOptions } from "nestjs-pino";
import { ConfigService } from "./modules/shared/services";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    SchedulerModule,

    ScheduleModule.forRoot(),
    MikroOrmModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [SharedModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<PinoOptions> => {
        return {
          pinoHttp: configService.isDevelopment()
            ? {
                level: "debug",
                prettyPrint: { colorize: true, leverFirst: true, translateTime: "UTC:mm/dd/yyyy" },
              }
            : {},
        } as PinoOptions;
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
