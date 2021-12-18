import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator";

export class UpdateRoomDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(128)
  public readonly title?: string;
}
