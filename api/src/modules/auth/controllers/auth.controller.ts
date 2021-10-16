import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { CreateUserDto } from "../../user/dto";
import { AuthService } from "../services";
import { IAuthRo } from "../interfaces/auth-ro.interface";
import { IJwtTokens } from "../interfaces";
import { UserService } from "../../user/services";

@Controller("auth")
export class AuthController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _authService: AuthService,
    protected readonly _userService: UserService,
  ) {}

  @Post("/sign-up")
  public async signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<IAuthRo> {
    const user = await this._authService.signUp(createUserDto, this._em);

    const tokens: IJwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({ userId: user.id, username: user.username }),
    };

    return {
      user: this._userService.buildUserRo(user),
      tokens,
    };
  }
}
