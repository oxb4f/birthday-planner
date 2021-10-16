import { IJwtTokens } from "./jwt-tokens.interface";
import { IUserRo } from "../../user/interfaces";

export interface IAuthRo {
  tokens: IJwtTokens;
  user: IUserRo;
}
