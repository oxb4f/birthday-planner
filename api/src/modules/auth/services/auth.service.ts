import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "../../user/services";
import { CreateUserDto } from "../../user/dto";
import { User } from "../../user/entities";
import { IJwtPayload, IJwtTokens } from "../interfaces";
import { IAuthRo } from "../interfaces/auth-ro.interface";
import { CredentialsDto, SignInDto } from "../dto";

@Injectable()
export class AuthService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _jwtService: JwtService,
    protected readonly _userService: UserService,

    @InjectPinoLogger(AuthService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async signUp(createUserDto: CreateUserDto, em: EntityManager): Promise<User> {
    return this._userService.createUser(createUserDto, em);
  }

  public async signIn(signInDto: SignInDto, em: EntityManager): Promise<User | null> {
    const user: User | null = await this._userService.getUserByUsername(signInDto.username, em);

    if (!(user !== null && user.password === User.passwordHash(signInDto.password))) {
      return null;
    }

    return user;
  }

  public checkPassword(password: string): boolean {
    return (
      /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(password) &&
      password.length >= 8 &&
      password.length <= 32
    );
  }

  public async checkUsername(username: string, em: EntityManager): Promise<boolean> {
    return (
      (await this._userService.checkFieldForUniqueness("username", username, em)) &&
      username.length >= 5 &&
      username.length <= 25
    );
  }

  public async checkCredentials(credentialsDto: CredentialsDto, em: EntityManager): Promise<boolean> {
    for (const key of Object.keys(credentialsDto)) {
      let validationResult = false;
      if (key === "password") {
        validationResult = this.checkPassword(credentialsDto[key]);
      } else if (key === "username") {
        validationResult = await this.checkUsername(credentialsDto[key], em);
      }

      if (!validationResult) {
        return false;
      }
    }

    return true;
  }

  public generateJwtAccessToken(payload: IJwtPayload): string {
    return this._jwtService.sign(payload);
  }

  public buildAuthRo(jwtTokens: IJwtTokens, user: User): IAuthRo {
    return {
      tokens: jwtTokens,
      user: this._userService.buildUserRo(user),
    };
  }
}
