import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

type Constructable = new (...args: any[]) => any;

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  public async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      throw new HttpException(
        errors.map((error) => Object.values(error.constraints || {}).join("\n")).join("\n"),
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }

  private toValidate(metatype: Constructable): boolean {
    const types: Constructable[] = [String, Boolean, Number, Array, Object];

    return !types.includes(metatype);
  }
}
