import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, Params, PinoLogger } from "nestjs-pino";
import { EntityManager } from "@mikro-orm/postgresql";

import { CreateUserDto } from "../dto";
import { User } from "../entities";
import { IUserRo } from "../interfaces";
import { wrap } from "mikro-orm";
import { excludeKeys } from "../../shared/helpers";

@Injectable()
export class UserService {
  constructor(
    protected readonly _em: EntityManager,

    @InjectPinoLogger(UserService.name)
    protected readonly _logger: PinoLogger,
  ) {}

  public async createUser(createUserDto: CreateUserDto, em: EntityManager): Promise<User> {
    const user = new User(createUserDto.username, createUserDto.password);

    em.persist(user);

    return user;
  }

  public async checkFieldForUniqueness(field: keyof User, value: unknown, em: EntityManager): Promise<boolean> {
    return (await em.count(User, { [field]: value })) === 0;
  }

  public async getUserByUserId(userId: number, em: EntityManager): Promise<User | null> {
    return em.findOne(User, { id: userId });
  }

  public async getUserByUsername(username: string, em: EntityManager): Promise<User | null> {
    return em.findOne(User, { username });
  }

  public async buildUserRo(
    user: User,
    populate: Array<string> = [],
    exclude?: Array<keyof IUserRo>,
  ): Promise<Partial<IUserRo>> {
    await wrap(user).init(true, populate);

    const userRo: IUserRo = {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return exclude?.length > 0 ? excludeKeys<IUserRo>(exclude, userRo) : userRo;
  }
}
