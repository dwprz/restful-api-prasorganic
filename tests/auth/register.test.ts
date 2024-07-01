import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { UserTestModel } from "../models/user/user.test.model";

// npx jest tests/auth/register.test.ts

describe("POST /api/users/current/register", () => {
  const user_email = "userTest123@gmail.com";
  const user_fullName = "User Test123";
  const user_password = "Password Test";
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  afterEach(async () => {
    await UserTestModel.delete();
  });

  afterAll(async () => {
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("register user should be successful", async () => {
    const result = await supertest(app)
      .post("/api/users/current/register")
      .send({
        email: user_email,
        full_name: user_fullName,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.error).toBeUndefined();
  });

  it("register user should fail if input is invalid", async () => {
    const result = await supertest(app)
      .post("/api/users/current/register")
      .send({
        email: 123456,
        full_name: user_fullName,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
