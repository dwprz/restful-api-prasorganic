import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "../user/user-test.util";
import { ProductTestUtil } from "../product/product-test.util";
import { CartTestUtil } from "./cart-test.util";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import orderShippingQueue from "../../src/queue/shipping.queue";

// npx jest tests/cart/get.test.ts

describe("GET /api/carts", () => {
  let admin_email: string;
  let admin_password: string;

  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await UserTestUtil.createAdmin();
    admin_email = admin!.email;
    admin_password = admin!.password;

    const user = await UserTestUtil.createUser();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    const product = await ProductTestUtil.createWithCategories();
    product_id = product!.product_id;

    await CartTestUtil.create(user_id, product_id);
  });

  afterAll(async () => {
    await CartTestUtil.delete(user_id);
    await ProductTestUtil.deleteWithCategories(product_id);
    await UserTestUtil.deleteAdmin();
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();
  });

  it("get cart should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/carts?page=1`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get cart should fail if not admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/carts?page=1`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("get cart should fail without authorization header", async () => {
    const result = await supertest(app).get("/api/carts?page=1");

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("get cart should fail without access token cookie", async () => {
    const result = await supertest(app)
      .get("/api/carts?page=1")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
