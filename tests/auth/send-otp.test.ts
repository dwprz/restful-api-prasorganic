import supertest from "supertest";
import app from "../../src/apps/application.app";
import { OtpTestModel } from "../models/otp/otp.test.model";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";

// npx jest tests/auth/send-otp.test.ts

describe("POST /api/users/current/otp", () => {
  const user_email = "prasorganic@gmail.com";
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  afterAll(async () => {
    await OtpTestModel.deleteByEmail(user_email);
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
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
