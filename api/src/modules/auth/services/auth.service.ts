import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "../../user/services";
import { CreateUserDto } from "../../user/dto";
import { User } from "../../user/entities";
import { AuthRo, JwtPayload, JwtTokens } from "../interfaces";
import { CredentialsDto, SignInDto } from "../dto";
import { RefreshToken } from "../entities";
import { GeneratorService } from "../../shared/services";

@Injectable()
export class AuthService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _jwtService: JwtService,
    protected readonly _userService: UserService,
    protected readonly _generatorService: GeneratorService,
    @InjectPinoLogger(AuthService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async signUp(em: EntityManager, createUserDto: CreateUserDto): Promise<User> {
    return this._userService.createUser(em, createUserDto);
  }

  public async signIn(em: EntityManager, signInDto: SignInDto): Promise<User | null> {
    const user: User | null = await this._userService.getUserByUsername(em, signInDto.username);

    if (!(user !== null && user.password === User.passwordHash(signInDto.password))) {
      return null;
    }

    return user;
  }

  public checkPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      password.length <= 32 &&
      /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(password)
    );
  }

  public async checkUsername(em: EntityManager, username: string): Promise<boolean> {
    return (
      username.length >= 5 &&
      username.length <= 25 &&
      (await this._userService.checkFieldForUniqueness(em, "username", username))
    );
  }

  public async checkCredentials(em: EntityManager, credentialsDto: CredentialsDto): Promise<boolean> {
    for (const key of Object.keys(credentialsDto)) {
      let validationResult = false;

      if (key === "password") {
        validationResult = this.checkPassword(credentialsDto[key]);
      } else if (key === "username") {
        validationResult = await this.checkUsername(em, credentialsDto[key]);
      }

      if (!validationResult) {
        return false;
      }
    }

    return true;
  }

  public async generateRefreshToken(em: EntityManager, expirationTime: number, user: User): Promise<RefreshToken> {
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
  ): Promise<RefreshToken | null> {
    const defaultPopulate = ["user"];

    return em.findOne(RefreshToken, { payload: refreshTokenPayload }, [...defaultPopulate, ...populate]);
  }

  public async refresh(
    em: EntityManager,
    refreshTokenPayload: string,
    newRefreshTokenExpirationTime: number,
  ): Promise<RefreshToken | null> {
    const refreshToken: RefreshToken | null = await this.getRefreshTokenByRefreshTokenPayload(em, refreshTokenPayload);
    if (refreshToken === null) {
      return null;
    }

    const { user } = refreshToken;

    em.remove(refreshToken);

    return this.generateRefreshToken(em, newRefreshTokenExpirationTime, user);
  }

  public generateJwtAccessToken(payload: JwtPayload): string {
    return this._jwtService.sign(payload);
  }

  public async buildAuthRo(em: EntityManager, jwtTokens: JwtTokens, user: User): Promise<AuthRo> {
    return {
      tokens: jwtTokens,
      user: await this._userService.buildUserRo(em, user),
    };
  }
}
