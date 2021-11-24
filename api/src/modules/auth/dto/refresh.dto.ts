import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshDto {
  @ApiProperty()
  @IsNotEmpty()
  public readonly refreshToken!: string;
}
