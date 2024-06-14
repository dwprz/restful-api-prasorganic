import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import { UserTestUtil } from "../user/user-test.util";
import redis from "../../src/apps/redis.app";

// npx jest tests/auth/authenticate.test.ts

describe("POST /api/users/current/authenticate", () => {
  let user_email: string;
  let user_password: string;
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    user_email = user!.email;
    user_password = user!.password;
  });

  afterAll(async () => {
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
  });

  it("authenticate user should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/users/current/authenticate")
      .send({
        password: user_password,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
  });

  it("authenticate user should fail without access token cookie", async () => {
    const result = await supertest(app)
      .post("/api/users/current/authenticate")
      .send({
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
