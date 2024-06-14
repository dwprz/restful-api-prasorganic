import supertest from "supertest";
import app from "../../src/apps/application.app";
import { ProductTestUtil } from "./product-test.util";
import { UserTestUtil } from "../user/user-test.util";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";

// npx jest tests/product/restore.test.ts

describe("POST /api/products/deleted/:productId/restore", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let admin_email: string;
  let admin_password: string;

  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await UserTestUtil.createSuperAdmin();
    super_admin_email = super_admin?.email!;
    super_admin_password = super_admin?.password!;

    const admin = await UserTestUtil.createAdmin();
    admin_email = admin?.email!;
    admin_password = admin?.password!;

    const product = await ProductTestUtil.createDeleted();
    product_id = product?.product_id!;
  });

  afterAll(async () => {
    await ProductTestUtil.deleteWithCategories(product_id);
    await UserTestUtil.deleteSuperAdmin();
    await UserTestUtil.deleteAdmin();
    await pool.end();
    await redis.quit();
  });

  it("restore product should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/products/deleted/${product_id}/restore`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("restore product should fail if not super admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/products/deleted/${product_id}/restore`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("restore product should fail if invalid access token", async () => {
    await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const result = await supertest(app)
      .post(`/api/products/deleted/${product_id}/restore`)
      .set("Cookie", ["access_token:INVALID ACCESS TOKEN"])
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("restore product should fail if without authorization", async () => {
    await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const result = await supertest(app).post(
      `/api/products/deleted/${product_id}/restore`
    );

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("restore product should fail if product not found", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/products/deleted/10000000/restore`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(404);
    expect(result.body.error).toBeDefined();
  });
});
