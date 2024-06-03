import supertest from "supertest";
import { userUtil } from "../user/user.util";
import app from "../../src/apps/app/app";
import { addressUtil } from "./address.util";

// npx jest tests/address/update-address.test.ts
const authSecret = process.env.AUTHORIZATION_SECRET;

describe("PATCH /api/addresses/:addressId", () => {
  beforeEach(async () => await userUtil.create());
  afterEach(async () => await addressUtil.remove());
  afterEach(async () => await userUtil.remove());

  it("should be successful update address", async () => {
    const resLogin = await supertest(app)
      .post("/api/users/login")
      .send({
        username: "USER TEST",
        password: "PASSWORD TEST",
      })
      .set("Authorization", authSecret!);

    const access_token = resLogin.body.access_token;

    const resCreate = await supertest(app)
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

    const address_id = resCreate.body.data.address_id;
    
    const result = await supertest(app)
      .patch(`/api/addresses/${address_id}`)
      .send({
        address_owner: "NEW ADDRESS OWNER",
      })
      .set("Authorization", access_token);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });
});
