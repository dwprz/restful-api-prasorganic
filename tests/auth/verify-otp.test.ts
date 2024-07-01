import supertest from "supertest";
import app from "../../src/apps/application.app";
import { OtpTestModel } from "../models/otp/otp.test.model";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";

// npx jest tests/auth/verify-otp.test.ts

describe("POST /api/users/current/otp/verify", () => {
  const email = "userTest123@gmail.com";
  const otp = "123456";
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeEach(async () => {
    await OtpTestModel.upsertByEmail(email, otp);
  });

  afterAll(async () => {
    await OtpTestModel.deleteByEmail(email);
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
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
