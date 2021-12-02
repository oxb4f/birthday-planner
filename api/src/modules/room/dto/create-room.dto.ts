import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class CreateRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(128)
  public readonly title!: string;
}
