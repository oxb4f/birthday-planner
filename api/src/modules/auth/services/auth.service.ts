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
    return this._userService.createUser(em, false, createUserDto);
  }

  public async signIn(em: EntityManager, signInDto: SignInDto): Promise<User> {
    return this._userService.getUser(em, {
      username: signInDto.username,
      password: User.passwordHash(signInDto.password),
    });
  }

  public async checkEmail(em: EntityManager, email: string): Promise<boolean> {
    return this._userService.checkFieldForUniqueness(em, "email", email);
  }

  public async checkUsername(em: EntityManager, username: string): Promise<boolean> {
    return this._userService.checkFieldForUniqueness(em, "username", username);
  }

  public async checkCredentials(em: EntityManager, credentialsDto: CredentialsDto): Promise<boolean> {
    for (const key of Object.keys(credentialsDto)) {
      if (key === "email" && !(await this.checkEmail(em, credentialsDto[key]))) {
        throw new HttpException(`Email "${credentialsDto[key]}" violates unique constraint`, HttpStatus.BAD_REQUEST);
      } else if (key === "username" && !(await this.checkUsername(em, credentialsDto[key]))) {
        throw new HttpException(`Username "${credentialsDto[key]}" violates unique constraint`, HttpStatus.BAD_REQUEST);
      }
    }

    return true;
  }
}
