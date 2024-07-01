import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { SuperAdminTestModel } from "../models/user/super-admin.test.model";
import { AdminTestModel } from "../models/user/admin.test.model";
import { ProductTestModel } from "../models/product/product.test.model";
import { DeletedProductTestModel } from "../models/deleted-product/deleted-product.test.model";

// npx jest tests/product/delete.test.ts

describe("DELETE /api/products/:productId", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let admin_email: string;
  let admin_password: string;

  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await SuperAdminTestModel.create();
    super_admin_email = super_admin?.email!;
    super_admin_password = super_admin?.password!;

    const admin = await AdminTestModel.create();
    admin_email = admin?.email!;
    admin_password = admin?.password!;
  });

  beforeEach(async () => {
    const product = await ProductTestModel.create();
    product_id = product?.product_id!;
  });

  afterAll(async () => {
    await SuperAdminTestModel.delete();
    await AdminTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  afterEach(async () => {
    await DeletedProductTestModel.delete(product_id);
    await ProductTestModel.delete(product_id);
  });

  it("delete product should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .delete(`/api/products/${product_id}`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
  });

  it("delete product should fail if not super admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .delete(`/api/products/${product_id}`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("delete product should fail if invalid access token", async () => {
    await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const result = await supertest(app)
      .delete(`/api/products/${product_id}`)
      .set("Cookie", ["access_token:INVALID ACCESS TOKEN"])
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("delete product should fail if without authorization", async () => {
    await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const result = await supertest(app).delete(`/api/products/${product_id}`);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("delete product should fail if invalid product id", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/products/INVALID PRODUCT ID`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
