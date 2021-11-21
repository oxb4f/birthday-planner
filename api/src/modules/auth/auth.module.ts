import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { forwardRef, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import * as authServices from "./services";
import * as authControllers from "./controllers";
import * as authStrategies from "./strategies";
import * as authEntities from "./entities";
import { ConfigService } from "../shared/services";
import { UserModule } from "../user/user.module";
import { User } from "../user/entities";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [
    SharedModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => ({
        secretOrPrivateKey: configService.get("JWT_SECRET_KEY"),
        signOptions: {
          expiresIn: configService.getNumber("JWT_EXPIRATION_TIME"),
        },
      }),
    }),
    MikroOrmModule.forFeature({
      entities: [...Object.values(authEntities), User],
    }),
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  providers: [...Object.values(authServices), ...Object.values(authStrategies)],
  controllers: Object.values(authControllers),
  exports: [
    ...Object.values(authServices),
    ...Object.values(authStrategies),
    PassportModule,
  ],
})
export class AuthModule {}
