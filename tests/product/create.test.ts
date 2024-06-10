import supertest from "supertest";
import { ProductTestUtil } from "./product-test.util";
import app from "../../src/apps/application.app";
import "dotenv/config";
import { UserTestUtil } from "../user/user-test.util";
import pool from "../../src/apps/database.app";

// npx jest tests/product/create.test.ts

describe("POST /api/products", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let admin_email: string;
  let admin_password: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await UserTestUtil.createSuperAdmin();
    super_admin_email = super_admin!.email;
    super_admin_password = super_admin!.password;

    const admin = await UserTestUtil.createAdmin();
    admin_email = admin!.email;
    admin_password = admin!.password;
  });

  afterAll(async () => {
    await UserTestUtil.deleteSuperAdmin();
    await UserTestUtil.deleteAdmin();
    await pool.end();
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
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .field("categories", "kurma")
      .field("categories", "organik")
      .attach("product_image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();

    const product_id = result.body.data.product_id;
    await ProductTestUtil.deleteWithCategories(product_id);
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
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .attach("product_image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();

    const product_id = result.body.data.product_id;
    await ProductTestUtil.deleteWithCategories(product_id);
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
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .attach("product_image", __dirname + "/assets/invalid-file.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
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
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .field("categories", "kurma")
      .field("categories", "organik")
      .attach("product_image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
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
      .field("description", "DESCRIPTION TEST")
      .field("categories", "grains")
      .field("categories", "kurma")
      .field("categories", "organik")
      .attach("product_image", __dirname + "/assets/product-image.jpg")
      .set("Cookie", cookies);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});