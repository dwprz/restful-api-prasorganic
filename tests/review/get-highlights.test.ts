import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { UserTestModel } from "../models/user/user.test.model";
import { ProductTestModel } from "../models/product/product.test.model";
import { OrderTestModel } from "../models/order/order.test.model";
import { nanoid } from "nanoid";
import { OrderStatus } from "../../src/interfaces/order.interface";
import { ReviewTestModel } from "../models/review/review.test.model";

// npx jest tests/review/get-highlights.test.ts

describe("GET /api/reviews/highlights", () => {
  let user_id: number;

  let order_id: string;
  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    user_id = user!.user_id;

    const product = await ProductTestModel.create();
    product_id = product!.product_id;

    order_id = nanoid();
    await OrderTestModel.create(
      user_id,
      order_id,
      OrderStatus.COMPLETED,
      product
    );

    await ReviewTestModel.createHighlight(user_id, product_id);
  });

  afterAll(async () => {
    await ReviewTestModel.delete(user_id, product_id);
    await OrderTestModel.delete(order_id);
    await ProductTestModel.delete(product_id);

    await UserTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("get highlighted reviews should be successful", async () => {
    const result = await supertest(app)
      .get("/api/reviews/highlights")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get highlighted reviews should fail if without authorization", async () => {
    const result = await supertest(app).get("/api/reviews/highlights");

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
