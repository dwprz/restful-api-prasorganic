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
import { SuperAdminTestModel } from "../models/user/super-admin.test.model";
import { AdminTestModel } from "../models/user/admin.test.model";

// npx jest tests/product/create.test.ts

describe("POST /api/products", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let admin_email: string;
  let admin_password: string;

  let product_id: number | undefined;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await SuperAdminTestModel.create();
    super_admin_email = super_admin!.email;
    super_admin_password = super_admin!.password;

    const admin = await AdminTestModel.create();
    admin_email = admin!.email;
    admin_password = admin!.password;
  });

  afterEach(async () => {
    if (product_id) {
      await ProductTestModel.delete(product_id);
    }
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

  it("create product should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/products")
      .field("product_name", "PRODUCT TEST")
      .field("price", 10000)
      .field("stock", 250)
      .field("length", 30)
      .field("width", 15)
      .field("height", 15)
      .field("weight", 5)
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .field("categories", "kurma")
      .field("categories", "organik")
      .attach("image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();

    product_id = result.body.data?.product_id;
  });

  it("create product with one category should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/products")
      .field("product_name", "PRODUCT TEST")
      .field("price", 10000)
      .field("stock", 250)
      .field("length", 30)
      .field("width", 15)
      .field("height", 15)
      .field("weight", 5)
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .attach("image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();

    product_id = result.body.data?.product_id;
  });

  it("create product should fail if image file is invalid", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/products")
      .field("product_name", "PRODUCT TEST")
      .field("price", 10000)
      .field("stock", 250)
      .field("length", 30)
      .field("width", 15)
      .field("height", 15)
      .field("weight", 5)
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .attach("image", __dirname + "/assets/invalid-file.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();

    product_id = result.body.data?.product_id;
  });

  it("create product should fail if file size is more than 1mb", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/products")
      .field("product_name", "PRODUCT TEST")
      .field("price", 10000)
      .field("stock", 250)
      .field("length", 30)
      .field("width", 15)
      .field("height", 15)
      .field("weight", 5)
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .attach("image", __dirname + "/assets/image-size-more-than-1mb.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();

    product_id = result.body.data?.product_id;
  });

  it("create product should fail if not super admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/products")
      .field("product_name", "PRODUCT TEST")
      .field("price", 10000)
      .field("stock", 250)
      .field("length", 30)
      .field("width", 15)
      .field("height", 15)
      .field("weight", 5)
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .field("categories", "kurma")
      .field("categories", "organik")
      .attach("image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();

    product_id = result.body.data?.product_id;
  });

  it("create product should fail if without authorization header", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/products")
      .field("product_name", "PRODUCT TEST")
      .field("price", 10000)
      .field("stock", 250)
      .field("length", 30)
      .field("width", 15)
      .field("height", 15)
      .field("weight", 5)
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .field("categories", "kurma")
      .field("categories", "organik")
      .attach("image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();

    product_id = result.body.data?.product_id;
  });
});
