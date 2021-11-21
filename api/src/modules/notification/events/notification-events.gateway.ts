import {
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";

import { JwtPayload } from "../../auth/interfaces";
import { ConfigService } from "../../shared/services";
import { NotificationType } from "../constants/enums";
import {
  ChangedFriendRequestStatusNotificationRo,
  FriendBirthdayNotificationRo,
  IncomingFriendRequestNotificationRo,
  NotificationRo,
} from "../interfaces";

@WebSocketGateway({ cors: true })
export class NotificationEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  protected readonly _server: Server;

  protected readonly _users: Map<number, Socket> = new Map<number, Socket>();

  constructor(protected readonly _configService: ConfigService) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const jwtToken: string =
        socket.handshake.headers["authorization"].split(" ")[1];

      const jwtPayload: JwtPayload = jwt.verify(
        jwtToken,
        this._configService.get("JWT_SECRET_KEY"),
      ) as JwtPayload;

      this._users.set(jwtPayload.userId, socket);
    } catch {
      throw new WsException("Not authorized for using ws gateway");
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    for (const [userId, _socket] of this._users) {
      if (_socket.id === socket.id) {
        this._users.delete(userId);
      }
    }
  }

  async emitNewNotification(
    type: NotificationType,
    to: number,
    payload:
      | ChangedFriendRequestStatusNotificationRo
      | FriendBirthdayNotificationRo
      | IncomingFriendRequestNotificationRo
      | NotificationRo,
  ): Promise<void> {
    this._users.get(to)?.emit(type, payload);
  }
}
