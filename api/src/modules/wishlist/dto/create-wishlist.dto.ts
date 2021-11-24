import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";

import { WishlistOptionDto } from "./wishlist-option.dto";

@ApiExtraModels(WishlistOptionDto)
export class CreateWishlistDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(128)
  @MinLength(10)
  public readonly description?: string;

  @ApiProperty({ type: [WishlistOptionDto], required: true })
  @IsArray()
  @ArrayNotEmpty()
  public readonly options!: ReadonlyArray<WishlistOptionDto>;
}
