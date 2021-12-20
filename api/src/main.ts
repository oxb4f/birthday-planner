import { NestFactory } from "@nestjs/core";
import * as helmet from "helmet";
import * as compression from "compression";

import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module";
import { SharedModule } from "./modules/shared/shared.module";
import { ConfigService } from "./modules/shared/services";
import { ExceptionsFilter } from "./modules/shared/filters";
import { ResponseInterceptor } from "./modules/shared/interceptors";

const globalPrefix = "api";

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("The Birthday planner API")
    .setVersion("0.1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${globalPrefix}/doc`, app, document);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });

  const configService = app.select(SharedModule).get(ConfigService);

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new ExceptionsFilter(configService));
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.use(compression());

  setupSwagger(app);

  await app.listen(configService.getNumber("NODE_PORT"));
}

bootstrap().catch((error) => {
  throw error;
});
