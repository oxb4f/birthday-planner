import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "../../user/services";
import { CreateUserDto } from "../../user/dto";
import { User } from "../../user/entities";
import { CredentialsDto, SignInDto } from "../dto";
import { GeneratorService } from "../../shared/services";
import { BaseAuthService } from "./base-auth.service";

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(
    em: EntityManager,
    jwtService: JwtService,
    userService: UserService,
    generatorService: GeneratorService,
    @InjectPinoLogger(AuthService.name)
    logger: PinoLogger,
  ) {
    super(em, jwtService, userService, generatorService, logger);
  }

  public async signUp(em: EntityManager, createUserDto: CreateUserDto): Promise<User> {
    return this._userService.createUser(em, createUserDto);
  }

  public async signIn(em: EntityManager, signInDto: SignInDto): Promise<User> {
    const user = await this._userService.getUser(em, { username: signInDto.username });

    if (!(user.password === User.passwordHash(signInDto.password))) {
      throw new HttpException("Invalid password", HttpStatus.BAD_REQUEST);
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
}
