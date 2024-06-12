import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import { ProductTestUtil } from "./product-test.util";
import pool from "../../src/apps/postgresql.app";

// npx jest tests/product/get-random.test.ts

describe("GET /api/products", () => {
  let products_ids: number[];

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const products = await ProductTestUtil.createManyWithCategories();
    products_ids = products?.map(({ product_id }) => product_id)!;
  });

  afterAll(async () => {
    await ProductTestUtil.deleteManyWithCategories(products_ids);
    await pool.end();
  });

  it("get random products should be successful", async () => {
    const result = await supertest(app)
      .get("/api/products?page=1")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get random products should fail if without page query", async () => {
    const result = await supertest(app)
      .get("/api/products")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("get random products should fail if page query more than 100", async () => {
    const result = await supertest(app)
      .get("/api/products?page=200")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("get random products should fail if without authorization", async () => {
    const result = await supertest(app).get("/api/products?page=1");

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
