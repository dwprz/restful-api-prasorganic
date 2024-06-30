import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { ReviewTestModel } from "../models/review/review.test.model";
import { nanoid } from "nanoid";
import { ProductTestModel } from "../models/product/product.test.model";
import { OrderTestModel } from "../models/order/order.test.model";
import { OrderStatus } from "../../src/interfaces/order.interface";
import { UserTestModel } from "../models/user/user.test.model";

// npx jest tests/review/create.test.ts

describe("POST /api/reviews", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product_id: number;
  let product: any;
  let order_id: string;
  let order_quantity: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    product = await ProductTestModel.create();
  });

  beforeEach(async () => {
    order_id = nanoid();

    const order = await OrderTestModel.create(
      user_id,
      order_id,
      OrderStatus.COMPLETED,
      product
    );

    product_id = order!.products[0].product_id;
    order_quantity = order!.products[0].quantity;
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

  afterEach(async () => {
    await ReviewTestModel.delete(user_id, product_id);
    await OrderTestModel.delete(order_id!);
  });

  it("create review should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/reviews`)
      .send([
        {
          product_id: product_id,
          quantity: order_quantity,
          rating: 5,
          review: null,
        },
      ])
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();
  }, 8000);

  it("create review should fail without access token cookie", async () => {
    const result = await supertest(app)
      .post("/api/reviews")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
