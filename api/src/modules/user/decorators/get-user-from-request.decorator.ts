import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../entities";

export const GetUserFromRequest = createParamDecorator((data: string, ctx: ExecutionContext): User => {
  if (ctx.getType() === "http") {
    const req = ctx.switchToHttp().getRequest();

    return data ? req.user[data] : req.user;
  } else if (ctx.getType() === "ws") {
    const user = ctx.switchToWs().getData().user;

    return data ? user[data] : user;
  }

  return undefined;
});
