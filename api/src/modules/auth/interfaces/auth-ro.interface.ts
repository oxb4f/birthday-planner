import { JwtTokens } from "./jwt-tokens.interface";
import { UserRo } from "../../user/interfaces";

export interface AuthRo {
  readonly tokens: JwtTokens;
  readonly user: Partial<UserRo>;
}
