import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "./user-test.util";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";

// npx jest tests/user/update-photo-profile.test.ts

describe("PATCH /api/users/current/photo-profile", () => {
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

  it("update user photo profile should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/users/current/photo-profile`)
      .field("photo_profile", "")
      .attach("image", __dirname + "/assets/profile.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(200);
    expect(result.body.error).toBeUndefined();
  });

  it("update user photo profile should fail if file is invalid", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .patch(`/api/users/current/photo-profile`)
      .field("photo_profile", "")
      .attach("image", __dirname + "/assets/invalid-file.jpg")
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  it("update user photo profile should fail without access token cookie", async () => {
    const result = await supertest(app)
      .patch("/api/users/current/photo-profile")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();
  });
});
