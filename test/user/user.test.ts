import supertest from "supertest";
import { utilUserTest } from "./utilUser";
import app from "../../src/applications/app.ts";

describe("POST /api/users/register", () => {
  afterEach(async () => await utilUserTest.remove());

  it("should successful register user", async () => {
    const result = await supertest(app)
      .post("/api/users/register")
      .send({
        username: "userTest",
        full_name: "nameTest",
        phone_number: "+16505553434",
        password: "rahasia",
      })
      .set("authorization", "rahasia");

    expect(result.status).toBe(200);
    expect(result.body.data).toBe("success register");
  });

  it("should be rejected if the user already exists", async () => {
    let result = await supertest(app)
      .post("/api/users/register")
      .send({
        username: "userTest",
        full_name: "nameTest",
        phone_number: "+16505553434",
        password: "rahasia",
      })
      .set("authorization", "rahasia");

    expect(result.status).toBe(200);
    expect(result.body.data).toBe("success register");

    result = await supertest(app)
      .post("/api/users/register")
      .send({
        username: "userTest",
        full_name: "nameTest",
        phone_number: "+16505553434",
        password: "rahasia",
      })
      .set("authorization", "rahasia");

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should be rejected if request incomplete", async () => {
    const result = await supertest(app)
      .post("/api/users/register")
      .send({
        username: "userTest",
        phone_number: "+16505553434",
        password: "rahasia",
      })
      .set("authorization", "rahasia");

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should fail if there is no authorization", async () => {
    const result = await supertest(app).post("/api/users/register").send({
      username: "userTest",
      full_name: "nameTest",
      phone_number: "+16505553434",
      password: "rahasia",
    });

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });

  it("should fail if authorization is incorrect", async () => {
    const result = await supertest(app)
      .post("/api/users/register")
      .send({
        username: "userTest",
        full_name: "nameTest",
        phone_number: "+16505553434",
        password: "rahasia",
      })
      .set("authorization", "salah");

    expect(result.status).toBe(401);
    expect(result.body.errors).toBeDefined();
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => await utilUserTest.create());
  afterEach(async () => await utilUserTest.remove());

  it("should be successful login", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "userTest",
      password: "rahasia",
    });

    expect(result.body.data.username).toBe("userTest");
    expect(result.body.data.full_name).toBe("nameTest");
    expect(result.body.data.phone_number).toBe("+16505553434");
    expect(result.body.token).toBeDefined();
  });

  it("should be rejected if username is incorrect", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "salah",
      password: "rahasia",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });

  it("should be rejected if password is incorrect", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "userTest",
      password: "salah",
    });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});
