import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "./user-test.util";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import orderShippingQueue from "../../src/queue/shipping.queue";

// npx jest tests/user/get-by-role.test.ts

describe("GET /api/users", () => {
  let admin_email: string;
  let admin_password: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await UserTestUtil.createAdmin();
    admin_email = admin!.email;
    admin_password = admin!.password;
  });

  afterAll(async () => {
    await UserTestUtil.deleteAdmin();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();
  });

  it("get users by role should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/users?role=ADMIN&page=1`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
    expect(result.body.paging).toBeDefined();
  });

  it("get user by role should fail without access token cookie", async () => {
    const result = await supertest(app)
      .get("/api/users?role=ADMIN&page=1")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
