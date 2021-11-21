import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CredentialsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  public readonly username?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  public readonly email?: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  public readonly password?: string;
}
