import { IsNotEmpty } from "class-validator";

export class GoogleAuthTokenDto {
  @IsNotEmpty()
  public readonly token!: string;
}
