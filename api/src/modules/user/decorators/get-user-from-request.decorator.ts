import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { User } from "../entities";

export const GetUserFromRequest = createParamDecorator(
  (data: string, ctx: ExecutionContext): User => {
    let user: User;
    switch (ctx.getType()) {
      case "http":
        user = ctx.switchToHttp().getRequest().user;
        break;
      case "ws":
        user = ctx.switchToWs().getData().user;
        break;
      default:
        throw new HttpException(
          "Unsupported schema: cannot get user",
          HttpStatus.BAD_REQUEST,
        );
    }

    return data ? user[data] : user;
  },
);
