import supertest from "supertest";
import { UserTestUtil } from "../user/user-test.util";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import { AddressTestUtil } from "./address-test.util";
import redis from "../../src/apps/redis.app";
import orderShippingQueue from "../../src/queue/shipping.queue";

// npx jest tests/address/create.test.ts

describe("POST /api/addresses", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;
  });

  afterAll(async () => {
    await AddressTestUtil.delete(user_id);
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();
  });

  it("create address should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post("/api/addresses")
      .send({
        address_owner: "NAME TEST",
        street: "STREET TEST",
        area_id: 14223,
        area: "Ngagel",
        lat: "-6.4912716",
        lng: "111.0370989",
        suburb_id: 1415,
        suburb: "Dukuhseti",
        city_id: 85,
        city: "Pati",
        province_id: 10,
        province: "Jawa Tengah",
        whatsapp: "08123456789",
        is_main_address: true,
      })
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();
  });
});
