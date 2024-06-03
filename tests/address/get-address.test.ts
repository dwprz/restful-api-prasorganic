import supertest from "supertest";
import { userUtil } from "../user/user.util";
import app from "../../src/apps/app/app";
import { addressUtil } from "./address.util";

// npx jest tests/address/get-address.test.ts
const authSecret = process.env.AUTHORIZATION_SECRET;

describe("GET /api/addresses", () => {
  beforeEach(async () => await userUtil.create());
  afterEach(async () => await addressUtil.remove());
  afterEach(async () => await userUtil.remove());

  it("should be successful create address", async () => {
    const resLogin = await supertest(app)
      .post("/api/users/login")
      .send({
        username: "USER TEST",
        password: "PASSWORD TEST",
      })
      .set("Authorization", authSecret!);

    const access_token = resLogin.body.access_token;

    await supertest(app)
      .post("/api/addresses")
      .send({
        address_owner: "NAME TEST",
        street: "STREET TEST",
        subdistrict: "SUBDISTRICT TEST",
        district: "DISTRICT TEST",
        province: "PROVINCE TEST",
        country: "COUNTRY TEST",
        postal_code: "12345",
        whatsapp: "WHATSAPP TEST",
        is_main_address: false,
      })
      .set("Authorization", access_token);

    const result = await supertest(app)
      .get("/api/addresses")
      .set("Authorization", access_token);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });
});
