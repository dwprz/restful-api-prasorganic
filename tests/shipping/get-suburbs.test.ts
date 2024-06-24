import supertest from "supertest";
import { UserTestUtil } from "../user/user-test.util";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import orderShippingQueue from "../../src/queue/shipping.queue";

// npx jest tests/shipping/get-suburbs.test.ts

describe("GET /api/shippings/suburbs", () => {
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
    await redis.quit();
    await orderShippingQueue.close();
  });

  it("get shippings suburbs should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/shippings/suburbs?cityId=85`)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get shippings suburbs should be fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/shippings/suburbs?cityId=85`)
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
