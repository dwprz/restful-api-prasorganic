import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "../user/user-test.util";
import pool from "../../src/apps/database.app";

// npx jest tests/auth/refresh-token.test.ts

describe("POST /api/users/current/refresh-token", () => {
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
  });

  it("refresh token should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/users/current/refresh-token")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.error).toBeUndefined();
    expect(result.get("Set-Cookie")).toBeDefined();
  });

  it("refresh token should fail without refresh token cookie", async () => {
    const result = await supertest(app)
      .post("/api/users/current/refresh-token")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
