import { Injectable } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import { EntityManager } from "@mikro-orm/postgresql";
import { JwtService } from "@nestjs/jwt";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ConfigService, GeneratorService } from "../../shared/services";
import { BaseAuthService } from "./base-auth.service";
import { UserService } from "../../user/services";
import { GoogleAuthTokenDto } from "../dto";
import { User } from "../../user/entities";
import { CreateUserGoogleDto } from "../../user/dto";

@Injectable()
export class AuthGoogleService extends BaseAuthService {
  protected readonly _oAuth2Client: OAuth2Client;

  constructor(
    protected readonly _configService: ConfigService,

    em: EntityManager,
    jwtService: JwtService,
    userService: UserService,
    generatorService: GeneratorService,
    @InjectPinoLogger(AuthGoogleService.name) logger: PinoLogger,
  ) {
    super(em, jwtService, userService, generatorService, logger);

    this._oAuth2Client = new OAuth2Client(
      this._configService.get("GOOGLE_AUTH_CLIENT_ID"),
      this._configService.get("GOOGLE_AUTH_CLIENT_SECRET"),
    );
  }

  public async signIn(em: EntityManager, googleAuthTokenDto: GoogleAuthTokenDto): Promise<User> {
    const tokenInfo = await this._oAuth2Client.getTokenInfo(googleAuthTokenDto.token);

    try {
      return this._userService.getUser(em, { email: tokenInfo.email });
    } catch (error) {
      return this.signUp(em, tokenInfo.email);
    }
  }

  public async signUp(em: EntityManager, email: string): Promise<User> {
    const createUserGoogleDto = new CreateUserGoogleDto(email);

    return this._userService.createUser(em, createUserGoogleDto);
  }
}
