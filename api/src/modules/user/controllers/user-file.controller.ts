import { EntityManager } from "@mikro-orm/knex";
import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { UserFileService, UserService } from "../services";
import { GetUserFromRequest } from "../decorators";
import { User } from "../entities/user.entity";
import { UserRo } from "../interfaces";
import { FileController } from "../../file/controllers";

@ApiTags("user")
@Controller()
export class UserFileController extends FileController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _userService: UserService,
    protected readonly _userFileService: UserFileService,
    @InjectPinoLogger(UserFileController.name) logger: PinoLogger,
  ) {
    super(_userFileService, logger);
  }

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @Post("/user/upload-avatar")
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor("file"))
  public async uploadUserAvatar(
    @GetUserFromRequest() user: User,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<UserRo> {
    const updatedUser = await this._em.transactional((em) =>
      this._userFileService.uploadUserAvatar(em, user, avatar),
    );

    return this._userService.buildUserRo(this._em, updatedUser);
  }
}
