import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { UserService } from "../services";

@ApiTags("user")
@Controller()
export class UserController {
  constructor(protected readonly _userService: UserService) {}

  @Get("/user/check-birthday-date")
  public async checkBirthdayDate(@Query("birthdayDate") birthdayDate: string): Promise<{ result: boolean }> {
    return { result: this._userService.checkBirthdayDate(birthdayDate) };
  }
}
