import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { UserTestModel } from "../models/user/user.test.model";
import { AddressTestModel } from "../models/address/address.test.model";

// npx jest tests/address/get-by-user-id.test.ts

describe("POST /api/addresses/user/:userId", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    await AddressTestModel.createMany(user!.user_id);
  });

  afterAll(async () => {
    await AddressTestModel.delete(user_id);
    await UserTestModel.delete();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("get addresses by user id should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/addresses/user/${user_id}`)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get addresses by user id should be fail if invalid user id", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/addresses/user/INVALID USER ID`)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
