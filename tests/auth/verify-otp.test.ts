import supertest from "supertest";
import app from "../../src/apps/application.app";
import { AuthTestUtil } from "./auth-test.util";
import pool from "../../src/apps/postgresql.app";

// npx jest tests/auth/verify-otp.test.ts

describe("POST /api/users/current/otp/verify", () => {
  const email = "userTest123@gmail.com";
  const otp = "123456";
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeEach(async () => {
    await AuthTestUtil.upsertOtpByEmail(email, otp);
  });

  afterAll(async () => {
    await AuthTestUtil.deleteOtpByEmail(email);
    await pool.end();
  });

  it("verify otp should be successful", async () => {
    const result = await supertest(app)
      .post("/api/users/current/otp/verify")
      .send({ email, otp })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
  });

  it("verify otp should fail if otp is incorrect", async () => {
    const result = await supertest(app)
      .post("/api/users/current/otp/verify")
      .send({
        email: email,
        otp: "inccorect otp",
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
