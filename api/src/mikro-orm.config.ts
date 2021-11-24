import { FileCacheAdapter, Options } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import * as dotenv from "dotenv";
import * as path from "path";

const env = process.env.NODE_ENV ?? "dev";

dotenv.config({
  path: `env/${env}/.env`,
});

const config = {
  type: "postgresql",
  host: process.env["POSTGRES_DB_HOST"],
  port: parseInt(process.env["POSTGRES_DB_PORT"] as string),
  user: process.env["POSTGRES_DB_USER"],
  password: process.env["POSTGRES_DB_PASSWORD"],
  dbName: process.env["POSTGRES_DB_NAME"],
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  debug: env === "dev",
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    tableName: "migrations_data",
    path: path.resolve(__dirname + "/migrations"),
    pattern: /^[\w-]+\d+\.ts$/,
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    emit: "ts",
  },
  cache: {
    enabled: true,
    pretty: env === "dev",
    adapter: FileCacheAdapter,
    options: { cacheDir: process.cwd() + "/temp" },
  },
  // resultCache: {
  //   expiration: 2000,
  //   adapter: RedisCacheAdapter,
  //   options: {
  //     host: process.env["REDIS_HOST"],
  //     port: process.env["REDIS_PORT"],
  //     db: process.env["REDIS_DB"],
  //     password: process.env["REDIS_PASSWORD"],
  //   },
  // },
} as Options;

export default config;
