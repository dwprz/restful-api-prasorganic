import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import { ProductTestUtil } from "./product-test.util";
import pool from "../../src/apps/postgresql.app";
import { UserTestUtil } from "../user/user-test.util";
import redis from "../../src/apps/redis.app";

// npx jest tests/product/get-deleted.test.ts

describe("GET /api/products/deleted", () => {
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

    const products = await ProductTestUtil.createManyDeleted();
    products_ids = products?.map(({ product_id }) => product_id)!;
  });

  afterAll(async () => {
    await ProductTestUtil.deleteManyWithCategories(products_ids);
    await UserTestUtil.deleteAdmin();
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
  });

  it("get deleted products should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products/deleted?page=1")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get deleted products should fail if not admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products/deleted?page=1")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("get deleted products should fail if without page query", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products/deleted")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("get deleted products should fail if page query more than 100", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products/deleted?page=200")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("get deleted products should fail if without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get("/api/products/deleted?page=1")
      .set("Cookie", cookies);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
