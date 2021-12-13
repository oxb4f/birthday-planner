import { Injectable } from "@nestjs/common";
import { parse as parseEnvFile } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

@Injectable()
export class ConfigService {
  private readonly _envConfig: Record<string, string>;
  private readonly _nodeEnv: string;

  constructor() {
    this._nodeEnv = process.env["NODE_ENV"] ?? "dev";

    const envPath =
      this._nodeEnv === "dev" || this._nodeEnv === "test" ? "env/.env" : ".env";

    this._envConfig = parseEnvFile(readFileSync(join(process.cwd(), envPath)));
  }

  public get env(): string {
    return this._nodeEnv;
  }

  public isDevelopment(): boolean {
    return this._nodeEnv === "dev";
  }

  public isProduction(): boolean {
    return this._nodeEnv === "production";
  }

  public isStaging(): boolean {
    return this._nodeEnv === "staging";
  }

  public get(key: string): string {
    return this._envConfig[key];
  }

  public getNumber(key: string): number {
    return parseInt(this._envConfig[key]);
  }
}
