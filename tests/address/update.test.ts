import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import {
  orderShippingQueue,
  orderShippingRedisClients,
} from "../../src/queue/shipping.queue";
import { UserTestModel } from "../models/user/user.test.model";
import { AddressTestModel } from "../models/address/address.test.model";

// npx jest tests/address/update.test.ts

describe("PUT /api/addresses/:addressId", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  let address_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestModel.create();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    const address = await AddressTestModel.create(user!.user_id);
    address_id = address.address_id;
  });

  afterAll(async () => {
    await AddressTestModel.delete(user_id);
    await UserTestModel.delete();
    await pool.end();
    await redis.quit();
    await orderShippingQueue.close();

    for (const client of orderShippingRedisClients) {
      await client.quit();
    }
  });

  it("update address should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .put(`/api/addresses/${address_id}`)
      .send({
        address_id: address_id,
        address_owner: "NEW NAME TEST",
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

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("update address should be fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .put(`/api/addresses/${address_id}`)
      .send({
        address_id: address_id,
        address_owner: "NEW NAME TEST",
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
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
