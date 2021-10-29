import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EntityManager } from "@mikro-orm/postgresql";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { UserService } from "../services";
import { UserRo } from "../interfaces";
import { GetUserFromRequest } from "../decorators";
import { UpdateUserDto } from "../dto";
import { User } from "../entities";

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
  public async getUserByUserId(@Param("userId", ParseIntPipe) userId: number): Promise<{ user: UserRo }> {
    const user = await this._userService.getUserByUserId(this._em, userId);
    if (user === null) {
      throw new HttpException(`User does not exist: id = ${userId}`, HttpStatus.BAD_REQUEST);
    }

    return { user: await this._userService.buildUserRo(this._em, user) };
  }

  @ApiBearerAuth()
  @Patch("/user/update")
  @UseGuards(AuthGuard())
  public async updateUser(
    @GetUserFromRequest() user: User,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ): Promise<{ user: UserRo }> {
    const updatedUser: User | null = await this._em.transactional((em) =>
      this._userService.updateUser(em, user.id, updateUserDto),
    );
    if (updatedUser === null) {
      throw new HttpException(`Cannot update user with id ${user.id}`, HttpStatus.BAD_REQUEST);
    }

    return { user: await this._userService.buildUserRo(this._em, user) };
  }
}
