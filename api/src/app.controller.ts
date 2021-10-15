import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  public async root(): Promise<string> {
    return "Test";
  }
}
