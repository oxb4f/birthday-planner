import { Injectable } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";
import * as crypto from "crypto";

@Injectable()
export class GeneratorService {
  public uuid(): string {
    return uuidV4();
  }

  public fileName(ext: string): string {
    return this.uuid() + "." + ext;
  }

  public randomHex(bytesLength = 16): string {
    return crypto.randomBytes(bytesLength).toString("hex");
  }

  public randomNum(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
