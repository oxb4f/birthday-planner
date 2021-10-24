import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { UserService } from "../services";
import { IUserRo } from "../interfaces";
import { EntityManager } from "@mikro-orm/postgresql";

@ApiTags("user")
@Controller()
export class UserController {
  constructor(protected readonly _em: EntityManager, protected readonly _userService: UserService) {}

  @Get("/user/check-birthday-date")
  public async checkBirthdayDate(@Query("birthdayDate") birthdayDate: string): Promise<{ result: boolean }> {
    return { result: this._userService.checkBirthdayDate(birthdayDate) };
  }

  @ApiBearerAuth()
  @Get("/user/:userId")
  @UseGuards(AuthGuard())
  public async getUserByUserId(@Param("userId", ParseIntPipe) userId: number): Promise<{ user: IUserRo }> {
    const user = await this._userService.getUserByUserId(this._em, userId);
    if (user === null) {
      throw new HttpException(`User does not exist: id = ${userId}`, HttpStatus.BAD_REQUEST);
    }

    return { user: await this._userService.buildUserRo(user) };
  }
}
