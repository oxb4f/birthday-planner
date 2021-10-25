import { IJwtTokens } from "./jwt-tokens.interface";
import { IUserRo } from "../../user/interfaces";

export interface IAuthRo {
  readonly tokens: IJwtTokens;
  readonly user: Partial<IUserRo>;
}
