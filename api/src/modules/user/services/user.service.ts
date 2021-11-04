import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";
import { wrap } from "mikro-orm";

import { User } from "../entities";
import { CreateUserDto, UpdateUserDto } from "../dto";
import { UserRo, UserRoOptions } from "../interfaces";
import { Mutable } from "../../shared/types";

@Injectable()
export class UserService {
  constructor(
    protected readonly _em: EntityManager,
    @InjectPinoLogger(UserService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async createUser(em: EntityManager, createUserDto: CreateUserDto): Promise<User> {
    const user = new User(createUserDto.username, createUserDto.password, createUserDto.birthdayDate);

    em.persist(user);

    return user;
  }

  public async checkFieldForUniqueness(em: EntityManager, field: keyof User, value: unknown): Promise<boolean> {
    return (await em.count(User, { [field]: value })) === 0;
  }

  public async getUserByUserId(em: EntityManager, userId: number, populate: Array<string> = []): Promise<User> {
    const defaultPopulate = [];

    return em.findOneOrFail(User, { id: userId }, [...defaultPopulate, ...populate]);
  }

  public async getUserByUsername(em: EntityManager, username: string, populate: Array<string> = []): Promise<User> {
    const defaultPopulate = [];

    return em.findOneOrFail(User, { username }, [...defaultPopulate, ...populate]);
  }

  public async updateUser(em: EntityManager, userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserByUserId(em, userId);

    if (
      updateUserDto.username !== undefined &&
      !(await this.checkFieldForUniqueness(em, "username", updateUserDto.username))
    ) {
      throw new HttpException("Username already belongs to the user", HttpStatus.BAD_REQUEST);
    }

    return wrap(user).assign(updateUserDto, { mergeObjects: true });
  }

  public checkBirthdayDate(birthdayDate: string): boolean {
    return /^(?:0[1-9]|[12]\d|3[01])[.](?:0[1-9]|1[012])[.](?:19|20)\d\d$/.test(birthdayDate);
  }

  public async buildUserRo(em: EntityManager, user: User, options?: UserRoOptions): Promise<UserRo> {
    const userRo = {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      birthdayDate: user.birthdayDate,
    } as Mutable<UserRo>;

    const populate: Array<string> = [];

    if (!!options?.numberOfWishlists) {
      populate.push("wishlists");
    }

    if (populate.length > 0) {
      await em.populate(user, populate);
    }

    userRo.numberOfWishlists = !!options?.numberOfWishlists ? user.wishlists.length : undefined;

    return userRo;
  }
}
