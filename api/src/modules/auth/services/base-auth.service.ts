import { EntityManager } from "@mikro-orm/postgresql";
import { JwtService } from "@nestjs/jwt";
import { PinoLogger } from "nestjs-pino";

import { User } from "../../user/entities";
import { RefreshToken } from "../entities";
import { AuthRo, JwtPayload, JwtTokens } from "../interfaces";
import { UserService } from "../../user/services";
import { GeneratorService } from "../../shared/services";

export abstract class BaseAuthService {
  protected constructor(
    protected readonly _em: EntityManager,
    protected readonly _jwtService: JwtService,
    protected readonly _userService: UserService,
    protected readonly _generatorService: GeneratorService,
    protected readonly _logger: PinoLogger,
  ) {}

  abstract signUp(...args: unknown[]): Promise<User>;
  abstract signIn(...args: unknown[]): Promise<User>;

  public async generateRefreshToken(
    em: EntityManager,
    expirationTime: number,
    user: User,
  ): Promise<RefreshToken> {
    let payload: string;
    do {
      payload = this._generatorService.randomHex(32);
    } while ((await em.count(RefreshToken, { payload })) > 0);

    const refreshToken = new RefreshToken(payload, expirationTime, user);

    em.persist(refreshToken);

    return refreshToken;
  }

  public async getRefreshTokenByRefreshTokenPayload(
    em: EntityManager,
    refreshTokenPayload: string,
    populate: Array<string> = [],
  ): Promise<RefreshToken> {
    const defaultPopulate = ["user"];

    return em.findOneOrFail(RefreshToken, { payload: refreshTokenPayload }, [
      ...defaultPopulate,
      ...populate,
    ]);
  }

  public async refresh(
    em: EntityManager,
    refreshTokenPayload: string,
    newRefreshTokenExpirationTime: number,
  ): Promise<RefreshToken> {
    const refreshToken = await this.getRefreshTokenByRefreshTokenPayload(
      em,
      refreshTokenPayload,
    );

    const { user } = refreshToken;

    em.remove(refreshToken);

    return this.generateRefreshToken(em, newRefreshTokenExpirationTime, user);
  }

  public generateJwtAccessToken(payload: JwtPayload): string {
    return this._jwtService.sign(payload);
  }

  public async buildAuthRo(
    em: EntityManager,
    jwtTokens: JwtTokens,
    user: User,
  ): Promise<AuthRo> {
    return {
      tokens: jwtTokens,
      user: await this._userService.buildUserRo(em, user),
    };
  }
}
