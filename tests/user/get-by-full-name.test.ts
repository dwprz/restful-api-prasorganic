import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "./user-test.util";
import pool from "../../src/apps/database.app";

// npx jest tests/user/get-by-full-name.test.ts

describe("GET /api/users/full-name/:fullName", () => {
  let admin_email: string;
  let admin_password: string;
  let admin_full_name: string;
  
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const admin = await UserTestUtil.createAdmin();
    admin_email = admin!.email;
    admin_full_name = admin!.full_name;
    admin_password = admin!.password;
  });

  afterAll(async () => {
    await UserTestUtil.deleteAdmin();
    await pool.end();
  });

  it("get users by full name should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: admin_email,
        password: admin_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .get(`/api/users/full-name/${admin_full_name}?role=ADMIN&page=1`)
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
    expect(result.body.paging).toBeDefined();
  });

  it("get user by full name should fail without access token cookie", async () => {
    const result = await supertest(app)
      .get(`/api/users/full-name/${admin_full_name}?role=ADMIN&page=1`)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
