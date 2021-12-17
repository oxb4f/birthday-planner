import {
  ExecutionContext,
  forwardRef,
  INestApplication,
  UnauthorizedException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { LoggerModule } from "nestjs-pino";
import { AwsSdkModule } from "nest-aws-sdk";
import * as request from "supertest";
import { sign, verify } from "jsonwebtoken";
import { AuthGuard } from "@nestjs/passport";

import { UserModule } from "../src/modules/user/user.module";
import { UserService } from "../src/modules/user/services";
import { UserController } from "../src/modules/user/controllers";
import { AuthModule } from "../src/modules/auth/auth.module";
import { NotificationModule } from "../src/modules/notification/notification.module";
import { SharedModule } from "../src/modules/shared/shared.module";
import { AuthController } from "../src/modules/auth/controllers";
import { AuthService } from "../src/modules/auth/services";
import { JwtPayload, JwtTokens } from "../src/modules/auth/interfaces";

describe("User (e2e)", () => {
  let app: INestApplication;

  const users = [
    {
      user: {
        id: 1,
        username: "test_username1",
        password: "Test_pass1",
        email: "test@test.com",
        firstName: null,
        lastName: null,
        birthdayDate: 1212121212,
        avatar: null,
      },
    },
  ];

  const userServiceMock = {
    getUser: (_: unknown, { id: userId }: { id: number }) =>
      users[userId - 1].user,

    buildUserRo: (_: unknown, user: any) => users[user.id - 1].user,
  };

  const authServiceMock = {
    signIn: (
      _: unknown,
      {
        username,
        password,
      }: {
        username: string;
        password: string;
      },
    ) => {
      const user = users.find(
        ({ user }) => username === user.username && password === user.password,
      );

      if (!user) {
        throw new Error();
      }

      return user.user;
    },

    generateJwtAccessToken: (payload: JwtPayload) => {
      return sign({ payload }, "somejwtsecret", {
        expiresIn: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      });
    },

    generateRefreshToken: () => ({ payload: "some_refresh_token" }),

    buildAuthRo: (_: unknown, tokens: JwtTokens, user: any) => ({
      tokens: { accessToken: tokens.accessToken },
      user,
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UserModule,
        MikroOrmModule.forRoot(),
        AuthModule,
        forwardRef(() => NotificationModule),
        SharedModule,
        LoggerModule.forRoot(),
        AwsSdkModule.forRoot(),
      ],
      controllers: [UserController, AuthController],
      providers: [
        {
          provide: UserService,
          useFactory: () => userServiceMock,
        },
        {
          provide: AuthService,
          useFactory: () => authServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard())
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();

          const jwtToken = req.headers["authorization"]?.split(" ")[1];
          try {
            const data: any = verify(jwtToken as string, "somejwtsecret");

            req.user = users[data.payload.userId - 1].user;
          } catch {
            throw new UnauthorizedException();
          }

          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it(`UNAUTH /GET (user/1)`, () => {
    return request(app.getHttpServer()).get("/user/1").expect(401);
  });

  it(`AUTH /GET (user/1)`, async () => {
    const resp = await request(app.getHttpServer())
      .post("/auth/sign-in")
      .send({ username: "test_username1", password: "Test_pass1" })
      .expect(201);

    const authToken = resp.body.tokens.accessToken;

    return request(app.getHttpServer())
      .get("/user/1")
      .set({ Authorization: `Bearer ${authToken}` })
      .expect(200)
      .expect({ user: users[0].user });
  });

  afterAll(async () => {
    await app.close();
  });
});
