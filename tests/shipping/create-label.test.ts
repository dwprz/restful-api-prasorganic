import supertest from "supertest";
import { UserTestUtil } from "../user/user-test.util";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import { OrderTestUtil } from "../order/order-test.util";
import { OrderStatus } from "../../src/interfaces/order.interface";
import orderShippingQueue from "../../src/queue/shipping.queue";
import { ShippingService } from "../../src/services/shipping.service";
import { nanoid } from "nanoid";

// npx jest tests/shipping/create-label.test.ts

describe("POST /api/shippings/labels", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let user_id: number;
  let user_email: string;
  let user_password: string;

  let order_id: string;
  let shipping_id: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await UserTestUtil.createSuperAdmin();
    super_admin_email = admin!.email;
    super_admin_password = admin!.password;

    const user = await UserTestUtil.createUser();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    order_id = nanoid();

    const order_details = await OrderTestUtil.createWithProductsOrder(
      user_id,
      order_id,
      OrderStatus.PAID
    );

    const order_with_products = order_details!;

    const shipping_order = await ShippingService.orderShipping(
      order_with_products
    );

    shipping_id = shipping_order.order_id;
  });

  afterAll(async () => {
    await OrderTestUtil.deleteWithProductsOrder(order_id);
    await UserTestUtil.deleteSuperAdmin();
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();
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

  it("create shipping label should be fail if not super admin", async () => {
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

  it("create shipping label should be fail without authorization", async () => {
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
