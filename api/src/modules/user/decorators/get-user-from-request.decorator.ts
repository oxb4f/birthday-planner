import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../entities";

export const GetUserFromRequest = createParamDecorator((data: string, ctx: ExecutionContext): User => {
  const req = ctx.switchToHttp().getRequest();

  return data ? req.user[data] : req.user;
});
