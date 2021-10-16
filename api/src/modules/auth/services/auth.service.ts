import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "../../user/services";
import { CreateUserDto } from "../../user/dto";
import { User } from "../../user/entities";
import { IJwtPayload, IJwtTokens } from "../interfaces";
import { IAuthRo } from "../interfaces/auth-ro.interface";
import { SignInDto } from "../dto";

@Injectable()
export class AuthService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _jwtService: JwtService,
    protected readonly _userService: UserService,
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
