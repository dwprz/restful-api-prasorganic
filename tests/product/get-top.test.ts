import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import { ProductTestUtil } from "./product-test.util";
import pool from "../../src/apps/postgresql.app";

// npx jest tests/product/get-top.test.ts

describe("GET /api/top-products", () => {
  let products_ids: number[];

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const products = await ProductTestUtil.createManyTopProducts();
    products_ids = products?.map(({ product_id }) => product_id)!;
  });

  afterAll(async () => {
    await ProductTestUtil.deleteManyWithCategories(products_ids);
    await pool.end();
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
