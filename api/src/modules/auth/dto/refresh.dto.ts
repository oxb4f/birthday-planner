import { IsNotEmpty } from "class-validator";

export class RefreshDto {
  @IsNotEmpty()
  public readonly refreshToken: string;
}
