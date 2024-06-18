import supertest from "supertest";
import app from "../../src/apps/application.app";
import { UserTestUtil } from "../user/user-test.util";
import { ProductTestUtil } from "../product/product-test.util";
import pool from "../../src/apps/postgresql.app";
import redis from "../../src/apps/redis.app";
import { OrderTestUtil } from "./order-test.util";

// npx jest tests/order/create.test.ts

describe("POST /api/orders", () => {
  let user_email: string;
  let user_password: string;
  let user_fullname: string;

  let product_id: number;
  let product_name: string;
  let product_image: string;
  let product_price: number;
  const quantity = 10;

  let order_id: number | undefined;

  const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;

  beforeAll(async () => {
    const user = await UserTestUtil.createUser();
    user_email = user!.email;
    user_password = user!.password;
    user_fullname = user!.full_name;

    const product = await ProductTestUtil.createWithCategories();
    product_id = product!.product_id;
    product_name = product!.product_name;
    product_image = product!.image;
    product_price = product!.price;
  });

  afterEach(async () => {
    if (order_id) {
      await OrderTestUtil.deleteWithProductsOrder(order_id);
    }
  });

  afterAll(async () => {
    await ProductTestUtil.deleteWithCategories(product_id);
    await UserTestUtil.deleteUser();
    await pool.end();
    await redis.quit();
  });

  it("create order should be successful", async () => {
    const login_result = await supertest(app)
      .post("/api/users/current/login")
      .send({
        email: user_email,
        password: user_password,
      })
      .set("Authorization", AUTHORIZATION_SECRET!);

    const cookies = login_result.get("Set-Cookie");

    const result = await supertest(app)
      .post(`/api/orders`)
      .send({
        order: {
          gross_amount: 50000,
          courier: "jne",
          email: user_email,
          buyer: user_fullname,

          address_owner: "John Doe",
          street: "goatan street, pantura state",
          subdistrict: "Northen",
          city: "Northen City",
          province: "Pantura",
          whatsapp: "08123456789",
        },
        products: [
          {
            product_id: product_id,
            product_name: product_name,
            image: product_image,
            quantity: quantity,
            price: product_price,
            total_gross_price: product_price * quantity,
          },
        ],
      })
      .set("Cookie", cookies)
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(201);
    expect(result.body.data).toBeDefined();

    order_id = result.body.data?.order.order_id || undefined;
  });

  it("create order should fail without access token cookie", async () => {
    const result = await supertest(app)
      .post("/api/orders")
      .set("Authorization", AUTHORIZATION_SECRET!);

    expect(result.status).toBe(401);
    expect(result.body.error).toBeDefined();

    order_id = result.body.data?.order.order_id || undefined;
  });
});
