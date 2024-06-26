import supertest from "supertest";
import { UserTestUtil } from "../user/user-test.util";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import { OrderTestUtil } from "./order-test.util";
import { OrderStatus } from "../../src/interfaces/order.interface";
import orderShippingQueue from "../../src/queue/shipping.queue";
import { nanoid } from "nanoid";

// npx jest tests/order/update-status.test.ts

describe("PATCH /api/orders/:orderId/statuses", () => {
  let super_admin_email: string;
  let super_admin_password: string;

  let user_id: number;
  let user_email: string;
  let user_password: string;

  let order_id: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const super_admin = await UserTestUtil.createSuperAdmin();
    super_admin_email = super_admin!.email;
    super_admin_password = super_admin!.password;

    const user = await UserTestUtil.createUser();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;
  });

  beforeEach(async () => {
    order_id = nanoid();

    await OrderTestUtil.create(user_id, order_id, OrderStatus.PENDING_PAYMENT);
  });

  afterAll(async () => {
    await UserTestUtil.deleteSuperAdmin();
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();
  });

  afterEach(async () => {
    await OrderTestUtil.delete(order_id);
  });

  it("update order status should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: super_admin_email,
        password: super_admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/orders/${order_id}/statuses`)
      .send({
        status: "IN_PROGRESS",
      })
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("update order status should fail if not super admin", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/orders/${order_id}/statuses`)
      .send({
        status: "PAID",
      })
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(403);
    expect(result.body.error).toBeDefined();
  });

  it("update order status should fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/orders/${order_id}/statuses`)
      .send({
        status: "PAID",
      })
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
