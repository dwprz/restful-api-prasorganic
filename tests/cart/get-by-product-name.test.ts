import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { CartTestModel } from "../models/cart/cart.test.model";
import { AdminTestModel } from "../models/user/admin.test.model";
import { UserTestModel } from "../models/user/user.test.model";
import { ProductTestModel } from "../models/product/product.test.model";

// npx jest tests/cart/get-by-product-name.test.ts

describe("GET /api/carts/products/:productName", () => {
  let admin_email: string;
  let admin_password: string;

  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product_id: number;
  let product_name: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await AdminTestModel.create();
    admin_email = admin!.email;
    admin_password = admin!.password;

    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    const product = await ProductTestModel.create();
    product_id = product!.product_id;
    product_name = encodeURIComponent(product!.product_name);

    await CartTestModel.create(user_id, product_id);
  });

  afterAll(async () => {
    await CartTestModel.delete(user_id);
    await ProductTestModel.delete(product_id);

    await AdminTestModel.delete();
    await UserTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("get carts by product name should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/carts/products/${product_name}/?page=1`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get carts by product name should fail if not admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/carts/products/${product_name}/?page=1`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("get carts by product name should fail without authorization header", async () => {
    const result = await supertest(app).get(
      `/api/carts/products/${product_name}/?page=1`
    );

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("get carts by product name should fail without access token cookie", async () => {
    const result = await supertest(app)
      .get(`/api/carts/products/${product_name}/?page=1`)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
