import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { FriendRequest } from "../../user/entities";
import { ChangedFriendRequestStatusNotification } from "../entities";

@Injectable()
export class NotificationService {
  constructor(protected readonly _em: EntityManager) {}

  public async createChangedFriendRequestStatusNotification(
    em: EntityManager,
    friendRequest: FriendRequest,
  ): Promise<ChangedFriendRequestStatusNotification> {
    const changedFriendRequestStatusNotification = new ChangedFriendRequestStatusNotification(friendRequest);

    em.persist(changedFriendRequestStatusNotification);

    return changedFriendRequestStatusNotification;
  }
}
