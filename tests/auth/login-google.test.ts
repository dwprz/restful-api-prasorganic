import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import { UserTestUtil } from "../user/user-test.util";
import redis from "../../src/apps/redis.app";

// npx jest tests/auth/login-google.test.ts

describe("POST /api/users/current/login/google", () => {
  const user_email = "userTest123@gmail.com";
  const user_fullName = "User Test123";
  const photo_profile = null;
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  afterEach(async () => {
    await UserTestUtil.deleteUser();
  });

  afterAll(async () => {
    await pool.end();
    await redis.quit();
  });

  it("login user with google should be successful", async () => {
    const result = await supertest(app)
      .post("/api/users/current/login/google")
      .send({
        email: user_email,
        full_name: user_fullName,
        photo_profile: photo_profile,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
    expect(result.get("Set-Cookie")).toBeDefined();
  });

  it("login user with google should fail if input is invalid", async () => {
    const result = await supertest(app)
      .post("/api/users/current/login/google")
      .send({
        email: user_email,
        full_name: 123456,
        photo_profile: photo_profile,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
