import supertest from "supertest";
import { UserTestUtil } from "../user/user-test.util";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/database.app";
import { AddressTestUtil } from "./address-test.util";

// npx jest tests/address/update.test.ts

describe("PUT /api/addresses/:addressId", () => {
  let user_id: number;
  let user_email: string;
  let user_password: string;

  let address_id: number;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    user_id = user!.user_id;
    user_email = user!.email;
    user_password = user!.password;

    const address = await AddressTestUtil.create(user!.user_id);
    address_id = address.address_id;
  });

  afterAll(async () => {
    await AddressTestUtil.delete(user_id);
    await UserTestUtil.deleteUser();
    await pool.end();
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
        subdistrict: "SUBDISTRICT TEST",
        district: "DISTRICT TEST",
        province: "NEW PROVINCE TEST",
        country: "COUNTRY TEST",
        postal_code: "12345",
        whatsapp: "WHATSAPP TEST",
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
        subdistrict: "SUBDISTRICT TEST",
        district: "DISTRICT TEST",
        province: "NEW PROVINCE TEST",
        country: "COUNTRY TEST",
        postal_code: "12345",
        whatsapp: "WHATSAPP TEST",
        is_main_address: true,
      })
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});