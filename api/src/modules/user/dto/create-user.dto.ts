import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
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

  @ApiProperty()
  @IsEmail()
  public readonly email!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  public readonly birthdayDate!: number;
}
