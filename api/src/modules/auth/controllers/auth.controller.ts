import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, ValidationPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EntityManager } from "@mikro-orm/postgresql";

import { CreateUserDto } from "../../user/dto";
import { AuthService } from "../services";
import { IAuthRo, IJwtTokens } from "../interfaces";
import { UserService } from "../../user/services";
import { CredentialsDto, RefreshDto, SignInDto } from "../dto";
import { User } from "../../user/entities";
import { RefreshToken } from "../entities";
import { ConfigService } from "../../shared/services";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _authService: AuthService,
    protected readonly _configService: ConfigService,
    protected readonly _userService: UserService,
  ) {}

  @Post("/sign-up")
  public async signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<IAuthRo> {
    const [user, refreshToken] = await this._em.transactional(async (em): Promise<[User, RefreshToken]> => {
      const user = await this._authService.signUp(em, createUserDto);
      const refreshToken = await this._authService.generateRefreshToken(
        em,
        this._configService.getNumber("JWT_EXPIRATION_TIME") * 3,
        user,
      );

      return [user, refreshToken];
    });

    const tokens: IJwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({ userId: user.id, username: user.username }),
      refreshToken: refreshToken.payload,
    };

    return this._authService.buildAuthRo(this._em, tokens, user);
  }

  @Post("/sign-in")
  public async signIn(@Body(new ValidationPipe()) signInDto: SignInDto): Promise<IAuthRo> {
    const user: User | null = await this._authService.signIn(this._em, signInDto);
    if (user === null) {
      throw new HttpException("Cannot sign in: invalid credentials", HttpStatus.BAD_REQUEST);
    }

    const refreshToken = await this._em.transactional(
      (em): Promise<RefreshToken> =>
        this._authService.generateRefreshToken(em, this._configService.getNumber("JWT_EXPIRATION_TIME") * 3, user),
    );

    const tokens: IJwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({ userId: user.id, username: user.username }),
      refreshToken: refreshToken.payload,
    };

    return this._authService.buildAuthRo(this._em, tokens, user);
  }

  @Post("/refresh")
  public async refresh(@Body(new ValidationPipe()) refreshDto: RefreshDto): Promise<IAuthRo> {
    const refreshToken: RefreshToken | null = await this._em.transactional(
      (em): Promise<RefreshToken> =>
        this._authService.refresh(
          em,
          refreshDto.refreshToken,
          this._configService.getNumber("JWT_EXPIRATION_TIME") * 3,
        ),
    );
    if (refreshToken === null) {
      throw new HttpException("Bad refresh token", HttpStatus.UNAUTHORIZED);
    }

    const { user } = refreshToken;

    const tokens: IJwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({ userId: user.id, username: user.username }),
      refreshToken: refreshToken.payload,
    };

    return this._authService.buildAuthRo(this._em, tokens, user);
  }

  @Get("/check-credentials")
  public async checkCredentials(@Query() credentialsDto: CredentialsDto): Promise<{ result: boolean }> {
    return { result: await this._authService.checkCredentials(this._em, credentialsDto) };
  }
}
