import supertest from "supertest";
import { UserTestUtil } from "../user/user-test.util";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import querystring from "querystring";

// npx jest tests/raja-ongkir/create-shipping-rate.test.ts

describe("POST /api/raja-ongkir/shipping-rate", () => {
  let user_email: string;
  let user_password: string;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    user_email = user!.email;
    user_password = user!.password;
  });

  afterAll(async () => {
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
  });

  it("create shipping rate should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/raja-ongkir/shipping-rate`)
      .send(
        querystring.stringify({
          origin: "4832",
          originType: "subdistrict",
          destination: "3382",
          destinationType: "subdistrict",
          weight: 1000,
          courier: "jne",
        })
      )
      .set("Cookie", cookies!)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();
  });

  it("create shipping rate should be fail without authorization", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/raja-ongkir/shipping-rate`)
      .send(
        querystring.stringify({
          origin: "4832",
          originType: "subdistrict",
          destination: "3382",
          destinationType: "subdistrict",
          weight: 1000,
          courier: "jne",
        })
      )
      .set("Cookie", cookies!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
