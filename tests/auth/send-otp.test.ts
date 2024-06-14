import supertest from "supertest";
import app from "../../src/apps/application.app";
import { AuthTestUtil } from "./auth-test.util";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";

// npx jest tests/auth/send-otp.test.ts

describe("POST /api/users/current/otp", () => {
  const user_email = "prasorganic@gmail.com";
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  afterAll(async () => {
    await AuthTestUtil.deleteOtpByEmail(user_email);
    await pool.end();
    await redis.quit();
  });

  it("send otp should be successful", async () => {
    const result = await supertest(app)
      .post("/api/users/current/otp")
      .send({
        email: user_email,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
  }, 15000 /* 15 detik */);

  it("send otp should fail if email is incorrect", async () => {
    const result = await supertest(app)
      .post("/api/users/current/otp")
      .send({
        email: "incorrectEmail",
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(500);
    expect(result.body.error).toBeDefined();
  });
});
