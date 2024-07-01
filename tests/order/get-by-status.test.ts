import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import { OrderStatus } from "../../src/interfaces/order.interface";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { nanoid } from "nanoid";
import { ProductTestModel } from "../models/product/product.test.model";
import { OrderTestModel } from "../models/order/order.test.model";
import { AdminTestModel } from "../models/user/admin.test.model";
import { UserTestModel } from "../models/user/user.test.model";

// npx jest tests/order/get-by-status.test.ts

describe("GET /api/orders/users/current", () => {
  let admin_email: string;
  let admin_password: string;

  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product: any;
  let product_id: number;

  let order_id: string;
  const status = OrderStatus.PENDING_PAYMENT;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await AdminTestModel.create();
    admin_email = admin!.email;
    admin_password = admin!.password;

    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    order_id = nanoid();

    product = await ProductTestModel.create();
    product_id = product.product_id;

    order_id = nanoid();
    await OrderTestModel.create(user_id, order_id, status, product);
  });

  afterAll(async () => {
    await OrderTestModel.delete(order_id);
    await ProductTestModel.delete(product_id);

    await UserTestModel.delete();
    await AdminTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("get orders by status should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/orders?status=${status}&page=1`)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get orders by status should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/orders?page=1`)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("get orders by status should fail if not admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/orders?page=1`)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("get orders by status should fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/orders?page=1`)
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
