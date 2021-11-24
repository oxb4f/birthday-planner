import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  public readonly username!: string;

  @ApiProperty()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  public readonly password!: string;
}
