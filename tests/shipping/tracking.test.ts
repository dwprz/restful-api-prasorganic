import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  OrderStatus,
  OrderWithProducts,
} from "../../src/interfaces/order.interface";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { nanoid } from "nanoid";
import { AdminTestModel } from "../models/user/admin.test.model";
import { UserTestModel } from "../models/user/user.test.model";
import { OrderTestModel } from "../models/order/order.test.model";
import { ProductTestModel } from "../models/product/product.test.model";

// npx jest tests/shipping/tracking.test.ts

describe("GET /api/shippings/:shippingId/trackings", () => {
  let admin_email: string;
  let admin_password: string;

  let user_id: number;

  let product: any;
  let product_id: number;

  let order: OrderWithProducts;
  let order_id: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await AdminTestModel.create();
    admin_email = admin!.email;
    admin_password = admin!.password;

    const user = await UserTestModel.create();
    user_id = user!.user_id;

    product = await ProductTestModel.create();
    product_id = product!.product_id;
  });

  beforeEach(async () => {
    order_id = nanoid();

    const order_details = await OrderTestModel.create(
      user_id,
      order_id,
      OrderStatus.PAID,
      product
    );

    order = order_details!;
  });

  afterAll(async () => {
    await ProductTestModel.delete(product_id);
    await AdminTestModel.delete();
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

  it("tracking order shipping should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const shipping_result = await supertest(app)
      .post(`/api/shippings/orders`)
      .send(order)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    const shipping_id = shipping_result.body.data.shipping_id;

    const result = await supertest(app)
      .get(`/api/shippings/${shipping_id}/trackings`)
      .set("Authorization", AUTHORIZATION_SECRET!)
      .set("Cookie", cookies);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  }, 10000);

  it("tracking order shipping should fail if not found", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/shippings/abcdefghijklmn/trackings`)
      .set("Authorization", AUTHORIZATION_SECRET!)
      .set("Cookie", cookies);

    expect(result.status).toBe(404);
    expect(result.body.error).toBeDefined();
  });

  it("tracking order shipping should fail if invalid shipping id", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/shippings/INVALID SHIPPING ID/trackings`)
      .set("Authorization", AUTHORIZATION_SECRET!)
      .set("Cookie", cookies);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("tracking order shipping should be fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/shippings/abcdefg/trackings`)
      .set("Cookie", cookies);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
