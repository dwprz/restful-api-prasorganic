import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import { ProductTestUtil } from "./product-test.util";
import pool from "../../src/apps/database.app";
import { UserTestUtil } from "../user/user-test.util";

// npx jest tests/product/get-with-categories-by-categories.test.ts

describe("GET /api/products-with-categories", () => {
  let admin_email: string;
  let admin_password: string;

  let user_email: string;
  let user_password: string;

  let products_ids: number[];

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await UserTestUtil.createAdmin();
    admin_email = admin!.email;
    admin_password = admin!.password;

    const user = await UserTestUtil.createUser();
    user_email = user!.email;
    user_password = user!.password;

    const products = await ProductTestUtil.createManyWithCategories();
    products_ids = products?.map(({ product_id }) => product_id)!;
  });

  afterAll(async () => {
    await ProductTestUtil.deleteManyWithCategories(products_ids);
    await UserTestUtil.deleteAdmin();
    await UserTestUtil.deleteUser();
    await pool.end();
  });

  it("get products with categories by categories should be successful", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products-with-categories?category=category1&page=1")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get products with categories by categories should fail if not admin", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products-with-categories?category=category1&page=1")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("get products with categories by categories should fail if without page query", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products-with-categories?category=category1")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("get products with categories by categories should fail if page query more than 100", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products-with-categories?category=category1&page=200")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("get products with categories by categories should fail if without authorization", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products-with-categories?category=category1&page=1")
      .set("Cookie", cookies);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
