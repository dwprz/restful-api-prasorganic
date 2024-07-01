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
import { OrderTestModel } from "../models/order/order.test.model";
import { ProductTestModel } from "../models/product/product.test.model";
import { UserTestModel } from "../models/user/user.test.model";

// npx jest tests/order/cancel.test.ts

describe("PATCH /api/orders/:orderId/cancellations", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product: any;
  let product_id: number;

  let order_id: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    product = await ProductTestModel.create();
    product_id = product.product_id;
  });

  beforeEach(async () => {
    order_id = nanoid();

    await OrderTestModel.create(
      user_id,
      order_id,
      OrderStatus.PENDING_PAYMENT,
      product
    );
  });

  afterAll(async () => {
    await ProductTestModel.delete(product_id);
    await UserTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  afterEach(async () => {
    await OrderTestModel.delete(order_id);
  });

  it("cancel order should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/orders/${order_id}/cancellations`)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("cancel order should fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/orders/${order_id}/cancellations`)
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
