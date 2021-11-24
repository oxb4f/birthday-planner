import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";
import { FilterQuery } from "@mikro-orm/core";
import { wrap } from "mikro-orm";

import { User } from "../entities";
import { CreateUserDto, CreateUserGoogleDto, UpdateUserDto } from "../dto";
import { UserRo, UserRoOptions } from "../interfaces";
import { Mutable } from "../../shared/types";

@Injectable()
export class UserService {
  constructor(
    protected readonly _em: EntityManager,
    @InjectPinoLogger(UserService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async createUser(
    em: EntityManager,
    registeredUsingGoogle: boolean,
    userCreationSchema: CreateUserDto | CreateUserGoogleDto,
  ): Promise<User> {
    let user: User;

    if (!registeredUsingGoogle) {
      user = new User(
        userCreationSchema.email,
        false,
        (userCreationSchema as CreateUserDto).username,
        (userCreationSchema as CreateUserDto).password,
        (userCreationSchema as CreateUserDto).birthdayDate,
      );
    } else {
      user = new User(userCreationSchema.email, true);
    }

    em.persist(user);

    return user;
  }

  public async checkFieldForUniqueness(
    em: EntityManager,
    field: keyof User,
    value: unknown,
  ): Promise<boolean> {
    return (await em.count(User, { [field]: value })) === 0;
  }

  public async getUser(
    em: EntityManager,
    filter: FilterQuery<User>,
    populate: Array<string> = [],
  ): Promise<User> {
    const defaultPopulate: Array<string> = [];

    return em.findOneOrFail(User, filter, [...defaultPopulate, ...populate]);
  }

  public async updateUser(
    em: EntityManager,
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.getUser(em, { id: userId });

    if (
      updateUserDto.username !== undefined &&
      !(await this.checkFieldForUniqueness(
        em,
        "username",
        updateUserDto.username,
      ))
    ) {
      throw new HttpException(
        "Username already belongs to the user",
        HttpStatus.BAD_REQUEST,
      );
    }

    return wrap(user).assign(updateUserDto, { mergeObjects: true, em });
  }

  public async buildUserRo(
    em: EntityManager,
    user: User,
    options?: UserRoOptions,
  ): Promise<UserRo> {
    const userRo = {
      userId: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthdayDate: user.birthdayDate,
      avatar: user.avatar,
    } as Mutable<UserRo>;

    const populate: Array<string> = [];

    if (!!options?.numberOfWishlists) {
      populate.push("wishlists");
    }

    if (populate.length > 0) {
      await em.populate(user, populate);
    }

    userRo.numberOfWishlists = !!options?.numberOfWishlists
      ? user.wishlists.length
      : undefined;

    return userRo;
  }
}
