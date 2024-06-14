import supertest from "supertest";
import app from "../../src/apps/application.app";
import pool from "../../src/apps/postgresql.app";
import { UserTestUtil } from "../user/user-test.util";
import redis from "../../src/apps/redis.app";

// npx jest tests/auth/login.test.ts

describe("POST /api/users/current/login", () => {
  let userEmail: string;
  let userPassword: string;
  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    userEmail = user!.email;
    userPassword = user!.password;
  });

  afterAll(async () => {
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
  });

  it("login user should be successful", async () => {
    const result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: userEmail,
        password: userPassword,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
    expect(result.get("Set-Cookie")).toBeDefined();
  });

  it("login user should fail if password is incorrect", async () => {
    const result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: userEmail,
        password: "Incorrect Password",
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
