import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EntityManager } from "@mikro-orm/postgresql";

import { CreateUserDto } from "../../user/dto";
import { AuthService } from "../services";
import { AuthRo, JwtTokens } from "../interfaces";
import { UserService } from "../../user/services";
import { CredentialsDto, RefreshDto, SignInDto } from "../dto";
import { User } from "../../user/entities";
import { RefreshToken } from "../entities";
import { ConfigService } from "../../shared/services";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly _jwtTokenExpirationTime: number =
    this._configService.getNumber("JWT_EXPIRATION_TIME") * 3;

  constructor(
    protected readonly _em: EntityManager,
    protected readonly _authService: AuthService,
    protected readonly _configService: ConfigService,
    protected readonly _userService: UserService,
  ) {}

  @Post("/sign-up")
  public async signUp(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<AuthRo> {
    const [user, refreshToken] = await this._em.transactional(
      async (em): Promise<[User, RefreshToken]> => {
        const user = await this._authService.signUp(em, createUserDto);
        const refreshToken = await this._authService.generateRefreshToken(
          em,
          this._jwtTokenExpirationTime,
          user,
        );

        return [user, refreshToken];
      },
    );

    const tokens: JwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({
        userId: user.id,
        username: user.username || undefined,
      }),
      refreshToken: refreshToken.payload,
    };

    return this._authService.buildAuthRo(this._em, tokens, user);
  }

  @Post("/sign-in")
  public async signIn(
    @Body(new ValidationPipe()) signInDto: SignInDto,
  ): Promise<AuthRo> {
    const user = await this._authService.signIn(this._em, signInDto);

    const refreshToken = await this._em.transactional(
      (em): Promise<RefreshToken> =>
        this._authService.generateRefreshToken(
          em,
          this._jwtTokenExpirationTime,
          user,
        ),
    );

    const tokens: JwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({
        userId: user.id,
        username: user.username || undefined,
      }),
      refreshToken: refreshToken.payload,
    };

    return this._authService.buildAuthRo(this._em, tokens, user);
  }

  @Post("/refresh")
  public async refresh(
    @Body(new ValidationPipe()) refreshDto: RefreshDto,
  ): Promise<AuthRo> {
    const refreshToken = await this._em.transactional(
      (em): Promise<RefreshToken> =>
        this._authService.refresh(
          em,
          refreshDto.refreshToken,
          this._jwtTokenExpirationTime,
        ),
    );

    const { user } = refreshToken;

    const tokens: JwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({
        userId: user.id,
        username: user.username || undefined,
      }),
      refreshToken: refreshToken.payload,
    };

    return this._authService.buildAuthRo(this._em, tokens, user);
  }

  @Get("/check-credentials")
  public async checkCredentials(
    @Query(new ValidationPipe({ transform: true }))
    credentialsDto: CredentialsDto,
  ): Promise<{ result: boolean }> {
    return {
      result: await this._authService.checkCredentials(
        this._em,
        credentialsDto,
      ),
    };
  }
}
