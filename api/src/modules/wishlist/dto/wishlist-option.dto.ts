import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class WishlistOptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(128)
  public readonly text!: string;
}
