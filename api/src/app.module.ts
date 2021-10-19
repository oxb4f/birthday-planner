import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { AppController } from "./app.controller";
import { SharedModule } from "./modules/shared/shared.module";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { LoggerModule, Params as PinoOptions } from "nestjs-pino";
import { ConfigService } from "./modules/shared/services";

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    SharedModule,
    UserModule,
    AuthModule,
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
