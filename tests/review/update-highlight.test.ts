import supertest from "supertest";
import app from "../../src/apps/application.app";
import "dotenv/config";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { AdminTestModel } from "../models/user/admin.test.model";
import { UserTestModel } from "../models/user/user.test.model";
import { ProductTestModel } from "../models/product/product.test.model";
import { OrderTestModel } from "../models/order/order.test.model";
import { nanoid } from "nanoid";
import { OrderStatus } from "../../src/interfaces/order.interface";
import { ReviewTestModel } from "../models/review/review.test.model";
import { SuperAdminTestModel } from "../models/user/super-admin.test.model";

// npx jest tests/review/update-highlight.test.ts

describe("PATCH /api/reviews/highlights/current", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let admin_email: string;
  let admin_password: string;

  let user_id: number;

  let order_id: string;
  let product_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await SuperAdminTestModel.create();
    super_admin_email = super_admin!.email;
    super_admin_password = super_admin!.password;

    const admin = await AdminTestModel.create();
    admin_email = admin!.email;
    admin_password = admin!.password;

    const user = await UserTestModel.create();
    user_id = user!.user_id;

    const product = await ProductTestModel.create();
    product_id = product!.product_id;

    order_id = nanoid();
    await OrderTestModel.create(
      user_id,
      order_id,
      OrderStatus.COMPLETED,
      product
    );

    await ReviewTestModel.create(user_id, product_id);
  });

  afterAll(async () => {
    await ReviewTestModel.delete(user_id, product_id);
    await OrderTestModel.delete(order_id);
    await ProductTestModel.delete(product_id);

    await SuperAdminTestModel.delete();
    await AdminTestModel.delete();
    await UserTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("update review highlight should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch("/api/reviews/highlights/current")
      .send({
        user_id: user_id,
        product_id: product_id,
        is_highlight: true,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("update review highlight should fail if not super admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch("/api/reviews/highlights/current")
      .send({
        user_id: user_id,
        product_id: product_id,
        is_highlight: true,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("update review highlight should fail if invalid request", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch("/api/reviews/highlights/current")
      .send({
        user_id: user_id,
        product_id: product_id,
        is_highlight: "hello world",
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("update review highlight should fail if without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch("/api/reviews/highlights/current")
      .send({
        user_id: user_id,
        product_id: product_id,
        is_highlight: true,
      })
      .set("Cookie", cookies);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
