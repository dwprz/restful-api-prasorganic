import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import { OrderStatus } from "../../src/interfaces/order.interface";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { ShippingService } from "../../src/services/shipping.service";
import { nanoid } from "nanoid";
import { ProductTestModel } from "../models/product/product.test.model";
import { OrderTestModel } from "../models/order/order.test.model";
import { SuperAdminTestModel } from "../models/user/super-admin.test.model";
import { UserTestModel } from "../models/user/user.test.model";

// npx jest tests/shipping/create-label.test.ts

describe("POST /api/shippings/labels", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let user_id: number;
  let user_email: string;
  let user_password: string;

  let product: any;
  let product_id: number;

  let order_id: string;
  let shipping_id: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await SuperAdminTestModel.create();
    super_admin_email = admin!.email;
    super_admin_password = admin!.password;

    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    order_id = nanoid();

    product = await ProductTestModel.create();
    product_id = product!.product_id;

    const order = await OrderTestModel.create(
      user_id,
      order_id,
      OrderStatus.PAID,
      product
    );

    const shipping_order = await ShippingService.orderShipping(order!);
    shipping_id = shipping_order.order_id;
  });

  afterAll(async () => {
    await OrderTestModel.delete(order_id);
    await ProductTestModel.delete(product_id);

    await SuperAdminTestModel.delete();
    await UserTestModel.delete();

    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("create shipping labels should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/shippings/labels`)
      .send({
        id: [shipping_id],
        type: "LBL",
      })
      .set("Authorization", AUTHORIZATION_SECRET!)
      .set("Cookie", cookies);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();
  }, 15000);

  it("create shipping receipts should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/shippings/labels`)
      .send({
        id: [shipping_id],
        type: "RCP",
      })
      .set("Authorization", AUTHORIZATION_SECRET!)
      .set("Cookie", cookies);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();
  }, 15000);

  it("create shipping label should fail if not super admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/shippings/labels`)
      .send({
        id: ["abcdefg"],
        type: "LBL",
      })
      .set("Authorization", AUTHORIZATION_SECRET!)
      .set("Cookie", cookies);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("create shipping label should fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/shippings/labels`)
      .send({
        id: ["abcdefg"],
        type: "LBL",
      })
      .set("Cookie", cookies);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
