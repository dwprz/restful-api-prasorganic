import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "../user/user-test.util";
import { ProductTestUtil } from "../product/product-test.util";
import { CartTestUtil } from "./cart-test.util";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";

// npx jest tests/cart/create.test.ts

describe("POST /api/carts/items", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    const product = await ProductTestUtil.createWithCategories();
    product_id = product!.product_id;
  });

  afterEach(async () => {
    await CartTestUtil.delete(user_id);
  });

  afterAll(async () => {
    await ProductTestUtil.deleteWithCategories(product_id);
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
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

    expect(result.status).toBe(200);
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

    expect(result.status).toBe(200);
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
