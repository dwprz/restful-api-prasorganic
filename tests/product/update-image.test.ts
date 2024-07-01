import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { SuperAdminTestModel } from "../models/user/super-admin.test.model";
import { AdminTestModel } from "../models/user/admin.test.model";
import { ProductTestModel } from "../models/product/product.test.model";

// npx jest tests/product/update-image.test.ts

describe("PATCH /api/products/:productId/image", () => {
  let admin_email: string;
  let admin_password: string;

  let super_admin_email: string;
  let super_admin_password: string;

  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await SuperAdminTestModel.create();
    super_admin_email = super_admin?.email!;
    super_admin_password = super_admin?.password!;

    const admin = await AdminTestModel.create();
    admin_email = admin?.email!;
    admin_password = admin?.password!;

    const product = await ProductTestModel.create();
    product_id = product?.product_id!;
  });

  afterAll(async () => {
    await ProductTestModel.delete(product_id);
    await SuperAdminTestModel.delete();
    await AdminTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("update product image should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/products/${product_id}/image`)
      .field("image", "http://example.com/image")
      .attach("image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("update product image should fail if not super admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/products/${product_id}/image`)
      .field("image", "http://example.com/image")
      .attach("image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("update product image should fail if invalid access token", async () => {
    await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const result = await supertest(app)
      .patch(`/api/products/${product_id}/image`)
      .field("image", "http://example.com/image")
      .attach("image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", ["access_token:INVALID ACCESS TOKEN"])
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("update product image should fail if image file is invalid", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/products/${product_id}/image`)
      .field("image", "http://example.com/image")
      .attach("image", __dirname + "/assets/invalid-file.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
