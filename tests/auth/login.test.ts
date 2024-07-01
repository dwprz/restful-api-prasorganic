import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { UserTestModel } from "../models/user/user.test.model";

// npx jest tests/auth/login.test.ts

describe("POST /api/users/current/login", () => {
  let userEmail: string;
  let userPassword: string;
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    userEmail = user!.email;
    userPassword = user!.password;
  });

  afterAll(async () => {
    await UserTestModel.delete();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("login user should be successful", async () => {
    const result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: userEmail,
        password: userPassword,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
    expect(result.get("Set-Cookie")).toBeDefined();
  });

  it("login user should fail if password is incorrect", async () => {
    const result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: userEmail,
        password: "Incorrect Password",
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
