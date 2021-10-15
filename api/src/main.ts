import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SharedModule } from "./modules/shared/shared.module";
import { ConfigService } from "./modules/shared/services";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  const configService = app.select(SharedModule).get(ConfigService);

  await app.listen(configService.getNumber("NODE_PORT"));
}

bootstrap().catch((error) => {
  throw error;
});
