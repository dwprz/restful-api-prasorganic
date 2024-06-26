import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { UserTestModel } from "../models/user/user.test.model";
import { OtpTestModel } from "../models/otp/otp.test.model";

// npx jest tests/user/update-email.test.ts

describe("PATCH /api/users/current/email", () => {
  let user_email: string;
  let new_user_email: string;
  let user_password: string;

  const otp = "123456";
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    user_email = user!.email;
    new_user_email = "new" + user!.email;
    user_password = user!.password;
  });

  beforeEach(async () => {
    await OtpTestModel.upsertByEmail(new_user_email, otp);
  });

  afterAll(async () => {
    await OtpTestModel.deleteByEmail(new_user_email);
    await UserTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("update user email should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/users/current/email`)
      .send({
        new_email: new_user_email,
        otp: otp,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
    expect(result.get("Set-Cookie")).toBeDefined();
  });

  it("update user email should fail without access token cookie", async () => {
    const result = await supertest(app)
      .patch("/api/users/current/email")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
