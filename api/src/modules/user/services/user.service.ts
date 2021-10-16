import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";

import { CreateUserDto } from "../dto";
import { User } from "../entities";
import { IUserRo } from "../interfaces";

@Injectable()
export class UserService {
  constructor(protected readonly _em: EntityManager) {}

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

  public buildUserRo(user: User): IUserRo {
    return { userId: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName };
  }
}
