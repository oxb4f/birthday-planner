import { NestFactory } from "@nestjs/core";
import * as helmet from "helmet";
import * as compression from "compression";

import { AppModule } from "./app.module";
import { SharedModule } from "./modules/shared/shared.module";
import { ConfigService } from "./modules/shared/services";
import { Logger } from "nestjs-pino";
import { ExceptionsFilter } from "./modules/shared/filters";
import { ResponseInterceptor } from "./modules/shared/interceptors";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.select(SharedModule).get(ConfigService);

  app.setGlobalPrefix("api");
  app.useGlobalFilters(new ExceptionsFilter(configService));
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.use(compression());

  await app.listen(configService.getNumber("NODE_PORT"));
}

bootstrap().catch((error) => {
  throw error;
});
