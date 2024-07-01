import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { CartTestModel } from "../models/cart/cart.test.model";
import { UserTestModel } from "../models/user/user.test.model";
import { ProductTestModel } from "../models/product/product.test.model";

// npx jest tests/cart/create.test.ts

describe("POST /api/carts/items", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    const product = await ProductTestModel.create();
    product_id = product!.product_id;
  });

  afterEach(async () => {
    await CartTestModel.delete(user_id);
  });

  afterAll(async () => {
    await ProductTestModel.delete(product_id);
    await UserTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("create cart should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/carts/items`)
      .send({
        product_id: product_id,
        quantity: 10,
        total_gross_price: 250000,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();
  });

  it("create cart should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    let result = await supertest(app)
      .post(`/api/carts/items`)
      .send({
        product_id: product_id,
        quantity: 10,
        total_gross_price: 250000,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    result = await supertest(app)
      .post(`/api/carts/items`)
      .send({
        product_id: product_id,
        quantity: 10,
        total_gross_price: 250000,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBe(null);
  });

  it("create cart should fail without access token cookie", async () => {
    const result = await supertest(app)
      .post("/api/carts/items")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
