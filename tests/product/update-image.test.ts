import supertest from "supertest";
import { ProductTestUtil } from "./product-test.util";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "../user/user-test.util";
import "dotenv/config";
import pool from "../../src/apps/database.app";

// npx jest tests/product/update-image.test.ts

describe("PATCH /api/products/:productId/image", () => {
  let admin_email: string;
  let admin_password: string;

  let super_admin_email: string;
  let super_admin_password: string;

  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await UserTestUtil.createSuperAdmin();
    super_admin_email = super_admin?.email!;
    super_admin_password = super_admin?.password!;

    const admin = await UserTestUtil.createAdmin();
    admin_email = admin?.email!;
    admin_password = admin?.password!;

    const product = await ProductTestUtil.createWithCategories();
    product_id = product?.product_id!;
  });

  afterAll(async () => {
    await ProductTestUtil.deleteWithCategories(product_id);
    await UserTestUtil.deleteSuperAdmin();
    await UserTestUtil.deleteAdmin();
    await pool.end();
  });

  it("update product image should be successful", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/products/${product_id}/image`)
      .field("image", "http://example.com/image")
      .attach("product_image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("update product image should fail if not super admin", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/products/${product_id}/image`)
      .field("image", "http://example.com/image")
      .attach("product_image", __dirname + "/assets/product-image.jpg")
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
      .attach("product_image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", ["access_token:INVALID ACCESS TOKEN"])
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });

  it("update product image should fail if image file is invalid", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/products/${product_id}/image`)
      .field("image", "http://example.com/image")
      .attach("product_image", __dirname + "/assets/invalid-file.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
