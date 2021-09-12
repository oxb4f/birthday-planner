import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      renderPath: "/test",
      rootPath: join(__dirname, "..", "public/test/templates"),
      serveStaticOptions: {
        extensions: ["html"],
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
