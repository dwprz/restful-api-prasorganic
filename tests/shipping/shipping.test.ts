import supertest from "supertest";
import { UserTestUtil } from "../user/user-test.util";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import { OrderTestUtil } from "../order/order-test.util";
import {
  OrderStatus,
  OrderWithProducts,
} from "../../src/interfaces/order.interface";
import orderShippingQueue from "../../src/queue/shipping.queue";
import { nanoid } from "nanoid";

// npx jest tests/shipping/shipping.test.ts

describe("POST /api/shippings/orders", () => {
  let admin_email: string;
  let admin_password: string;

  let user_id: number;
  let order_with_products: OrderWithProducts;
  let order_id: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await UserTestUtil.createAdmin();
    admin_email = admin!.email;
    admin_password = admin!.password;

    const user = await UserTestUtil.createUser();
    user_id = user!.user_id;
  });

  beforeEach(async () => {
    order_id = nanoid();

    const order_details = await OrderTestUtil.createWithProductsOrder(
      user_id,
      order_id,
      OrderStatus.PAID
    );

    order_with_products = order_details!;
  });

  afterAll(async () => {
    await UserTestUtil.deleteAdmin();
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();
  });

  afterEach(async () => {
    await OrderTestUtil.deleteWithProductsOrder(order_id);
  });

  it("order shipping should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/shippings/orders`)
      .send(order_with_products)
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("order shipping should be fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/shippings/orders`)
      .send(order_with_products)
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
