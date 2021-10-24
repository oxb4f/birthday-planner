import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";

import { CreateUserDto } from "../dto";
import { User } from "../entities";
import { IUserRo } from "../interfaces";

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

  public async getUserByUserId(em: EntityManager, userId: number, populate: Array<string> = []): Promise<User | null> {
    const defaultPopulate = [];

    return em.findOne(User, { id: userId }, [...defaultPopulate, ...populate]);
  }

  public async getUserByUsername(
    em: EntityManager,
    username: string,
    populate: Array<string> = [],
  ): Promise<User | null> {
    const defaultPopulate = [];

    return em.findOne(User, { username }, [...defaultPopulate, ...populate]);
  }

  public checkBirthdayDate(birthdayDate: string): boolean {
    return /^(?:0[1-9]|[12]\d|3[01])[.](?:0[1-9]|1[012])[.](?:19|20)\d\d$/.test(birthdayDate);
  }

  public async buildUserRo(user: User): Promise<IUserRo> {
    await this._em.populate(user, []);

    return {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
