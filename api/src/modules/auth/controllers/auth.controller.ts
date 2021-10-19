import { ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { ValidationPipe } from "../../shared/pipes";
import { CreateUserDto } from "../../user/dto";
import { AuthService } from "../services";
import { IAuthRo } from "../interfaces/auth-ro.interface";
import { IJwtTokens } from "../interfaces";
import { UserService } from "../../user/services";
import { CredentialsDto, SignInDto } from "../dto";
import { User } from "../../user/entities";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _authService: AuthService,
    protected readonly _userService: UserService,
  ) {}

  @Post("/sign-up")
  public async signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<IAuthRo> {
    const user = await this._em.transactional((em) => this._authService.signUp(createUserDto, em));

    const tokens: IJwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({ userId: user.id, username: user.username }),
    };

    return this._authService.buildAuthRo(tokens, user);
  }

  @Post("/sign-in")
  public async signIn(@Body(new ValidationPipe()) signInDto: SignInDto): Promise<IAuthRo> {
    const user: User | null = await this._authService.signIn(signInDto, this._em);
    if (user === null) {
      throw new HttpException("Cannot sign in: invalid credentials", HttpStatus.BAD_REQUEST);
    }

    const tokens: IJwtTokens = {
      accessToken: this._authService.generateJwtAccessToken({ userId: user.id, username: user.username }),
    };

    return this._authService.buildAuthRo(tokens, user);
  }

  @Get("/check-credentials")
  public async checkCredentials(@Query() credentialsDto: CredentialsDto): Promise<{ result: boolean }> {
    return { result: await this._authService.checkCredentials(credentialsDto, this._em) };
  }
}
