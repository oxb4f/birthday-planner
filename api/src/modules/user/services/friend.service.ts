import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { Friend, FriendRequest, User } from "../entities";
import { FriendRequestRo, FriendRequestRoOptions, FriendRo, FriendRoOptions } from "../interfaces";
import { UserService } from "./user.service";
import { Mutable } from "../../shared/types";
import { FriendRequestStatus } from "../constants/enums";

@Injectable()
export class FriendService {
  constructor(
    protected readonly _em: EntityManager,
    protected readonly _userService: UserService,
    @InjectPinoLogger(FriendService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async createFriend(em: EntityManager, user: User, to: User): Promise<Friend> {
    if (user.id === to.id || (await this.isFriends(em, user, to))) {
      throw new HttpException("Users are friends or user sent himself a request", HttpStatus.BAD_REQUEST);
    }

    const friend1 = new Friend(user, to);
    const friend2 = new Friend(to, user);

    em.persist([friend1, friend2]);

    return friend1;
  }

  public async createFriendRequest(em: EntityManager, from: User, to: User): Promise<FriendRequest> {
    if (
      from.id === to.id ||
      (await this.isFriends(em, from, to)) ||
      (await em.count(FriendRequest, { from, to, status: FriendRequestStatus.PENDING })) > 0
    ) {
      throw new HttpException(
        "Users are friends or friend request has already been sent or user sent himself a request",
        HttpStatus.BAD_REQUEST,
      );
    }

    const friendRequest = new FriendRequest(from, to);

    em.persist(friendRequest);

    return friendRequest;
  }

  public async getFriendRequestByFriendRequestId(
    em: EntityManager,
    friendRequestId: number,
    populate: Array<string> = [],
  ): Promise<FriendRequest> {
    const defaultPopulate = ["from", "to"];

    return em.findOneOrFail(FriendRequest, { id: friendRequestId }, [...defaultPopulate, ...populate]);
  }

  public async changeFriendRequestStatus(
    em: EntityManager,
    friendRequestId: number,
    newStatus: FriendRequestStatus,
  ): Promise<FriendRequest> {
    const friendRequest = await this.getFriendRequestByFriendRequestId(em, friendRequestId);

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new HttpException("Friend request has already been answered", HttpStatus.BAD_REQUEST);
    }

    if (newStatus === FriendRequestStatus.ACCEPTED) {
      await this.createFriend(em, friendRequest.from, friendRequest.to);
    }

    friendRequest.status = newStatus;

    return friendRequest;
  }

  public async getUserFriendsByUserId(
    em: EntityManager,
    userId: number,
    populate: Array<string> = [],
  ): Promise<Array<Friend>> {
    const defaultPopulate = ["user"];

    return em.find(Friend, { to: userId }, [...defaultPopulate, ...populate]);
  }

  public async isFriends(em: EntityManager, user1: User | number, user2: User | number): Promise<boolean> {
    return (await em.count(Friend, { user: user1, to: user2 })) > 0;
  }

  public async buildFriendRo(em: EntityManager, friend: Friend, friendRoOptions?: FriendRoOptions): Promise<FriendRo> {
    const populate: Array<string> = ["user"];

    if (!!friendRoOptions?.showWhoseFriend) {
      populate.push("to");
    }

    await em.populate(friend, populate);

    const friendRo = {
      user: await this._userService.buildUserRo(em, friend.user),
    } as Mutable<FriendRo>;

    friendRo.to = !!friendRoOptions?.showWhoseFriend ? await this._userService.buildUserRo(em, friend.to) : undefined;

    return friendRo;
  }

  public async buildFriendRequestRo(
    em: EntityManager,
    friendRequest: FriendRequest,
    friendRequestRoOptions?: FriendRequestRoOptions,
  ): Promise<FriendRequestRo> {
    const populate: Array<string> = ["from"];

    if (!!friendRequestRoOptions?.showFriendRequestWasSentTo) {
      populate.push("to");
    }

    await em.populate(friendRequest, populate);

    const friendRequestRo = {
      friendRequestId: friendRequest.id,
      from: await this._userService.buildUserRo(em, friendRequest.from),
      status: friendRequest.status,
    } as Mutable<FriendRequestRo>;

    friendRequestRo.to = !!friendRequestRoOptions?.showFriendRequestWasSentTo
      ? await this._userService.buildUserRo(em, friendRequest.to)
      : undefined;

    return friendRequestRo;
  }
}
