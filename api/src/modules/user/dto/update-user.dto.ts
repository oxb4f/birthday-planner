import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  public readonly username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  public readonly firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  public readonly lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^(?:0[1-9]|[12]\d|3[01])[.](?:0[1-9]|1[012])[.](?:19|20)\d\d$/)
  public readonly birthdayDate?: string;
}
