import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "./user-test.util";
import pool from "../../src/apps/database.app";

// npx jest tests/user/update.test.ts

describe("PATCH /api/users/current", () => {
  let user_email: string;
  let user_fullName: string;
  let user_password: string;
  
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    user_email = user!.email;
    user_fullName = user!.full_name;
    user_password = user!.password;
  });

  afterAll(async () => {
    await UserTestUtil.deleteUser();
    await pool.end();
  });

  it("update user should be successful", async () => {
    const loginRes = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = loginRes.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/users/current`)
      .send({
        full_name: "New " + user_fullName,
        password: user_password,
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });

  it("update user should fail without access token cookie", async () => {
    const result = await supertest(app)
      .patch("/api/users/current")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
