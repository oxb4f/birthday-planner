import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class SignInDto {
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  public readonly username: string;

  @MinLength(8)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  public readonly password: string;
}
