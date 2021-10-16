import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "../../user/services";
import { CreateUserDto } from "../../user/dto";
import { User } from "../../user/entities";
import { IJwtPayload, IJwtTokens } from "../interfaces";
import { IAuthRo } from "../interfaces/auth-ro.interface";

@Injectable()
export class AuthService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _jwtService: JwtService,
    protected readonly _userService: UserService,
  ) {}

  public async signUp(createUserDto: CreateUserDto, em: EntityManager): Promise<User> {
    return em.transactional((em) => this._userService.createUser(createUserDto, em));
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
