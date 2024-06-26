import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { ProductTestModel } from "../models/product/product.test.model";

// npx jest tests/product/get-top.test.ts

describe("GET /api/top-products", () => {
  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const products = await ProductTestModel.createTopProduct();
    product_id = products!.product_id;
  });

  afterAll(async () => {
    await ProductTestModel.delete(product_id);
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("get top products should be successful", async () => {
    const result = await supertest(app)
      .get("/api/top-products")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get top products should fail if without authorization", async () => {
    const result = await supertest(app).get("/api/top-products");

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
