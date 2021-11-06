import { IsEmail, validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserGoogleDto {
  @ApiProperty()
  @IsEmail()
  public readonly email: string;

  constructor(email: string) {
    this.email = email;
  }
}
