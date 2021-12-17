import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";

import { AppModule } from "../src/app.module";

describe("App (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it(`/GET (/)`, () => {
    return request(app.getHttpServer()).get("/").expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
