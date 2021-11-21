import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { FriendService } from "../services";
import { FriendRequestRo, FriendRo } from "../interfaces";
import { GetUserFromRequest } from "../decorators";
import { User } from "../entities";
import { UserService } from "../services";
import { ChangeFriendRequestStatusDto } from "../dto";

@ApiTags("user")
@Controller()
export class FriendController {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _friendService: FriendService,
    protected readonly _userService: UserService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get("/user/:userId/friends")
  public async getUserFriendsByUserId(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<FriendRo[]> {
    const friends = await this._friendService.getUserFriendsByUserId(
      this._em,
      userId,
    );

    return Promise.all(
      friends.map((friend) =>
        this._friendService.buildFriendRo(this._em, friend),
      ),
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post("/user/friends/add-friend")
  public async addFriend(
    @GetUserFromRequest() user: User,
    @Query("userId", ParseIntPipe) userId: number,
  ): Promise<{ friendRequest: FriendRequestRo }> {
    const friendRequest = await this._em.transactional(async (em) =>
      this._friendService.createFriendRequest(
        em,
        user,
        await this._userService.getUser(em, { id: userId }),
      ),
    );

    return {
      friendRequest: await this._friendService.buildFriendRequestRo(
        this._em,
        friendRequest,
        {
          showFriendRequestWasSentTo: true,
        },
      ),
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Patch(
    "/user/friends/friendRequest/:friendRequestId/change-friend-request-status",
  )
  public async changeFriendRequestStatus(
    @Param("friendRequestId", ParseIntPipe) friendRequestId: number,
    @Query(new ValidationPipe({ transform: true }))
    changeFriendRequestStatusDto: ChangeFriendRequestStatusDto,
  ): Promise<{ friendRequest: FriendRequestRo }> {
    const friendRequest = await this._em.transactional((em) =>
      this._friendService.changeFriendRequestStatus(
        em,
        friendRequestId,
        changeFriendRequestStatusDto.newStatus,
      ),
    );

    return {
      friendRequest: await this._friendService.buildFriendRequestRo(
        this._em,
        friendRequest,
      ),
    };
  }
}
