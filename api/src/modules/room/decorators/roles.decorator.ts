import { Role } from "../constants/enum";
import { SetMetadata } from "@nestjs/common";

export const ROLES_METADATA_KEY = "__roles__";

export const Roles = (...args: Array<Role>) =>
  SetMetadata(ROLES_METADATA_KEY, args);
