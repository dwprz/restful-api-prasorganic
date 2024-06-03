import supertest from "supertest";
import { productUtil } from "../product/product.util";
import { userUtil } from "../user/user.util";
import app from "../../src/apps/app/app";
import { cartUtil } from "../cart/cart.util";
import { orderUtil } from "./order.util";

// npx jest tests/order/create-order.test.ts
const authSecret = process.env.AUTHORIZATION_SECRET;

describe("POST /api/orders", () => {
  beforeEach(async () => await userUtil.create());
  beforeEach(async () => await productUtil.create());

  afterEach(async () => await orderUtil.remove());
  afterEach(async () => await cartUtil.remove());
  afterEach(async () => await productUtil.remove());
  afterEach(async () => await userUtil.remove());

  it("should be successful create order", async () => {
    const resLogin = await supertest(app)
      .post("/api/users/login")
      .send({
        username: "USER TEST",
        password: "PASSWORD TEST",
      })
      .set("Authorization", authSecret!);

    const access_token = resLogin.body.access_token;
    const product = await productUtil.get();
    const { product_id, product_name, image, price, stock } = product!;

    const resCart = await supertest(app)
      .post("/api/carts")
      .send({
        product_name: product_name,
        image: image,
        quantity: 5,
        price: price,
        total_price: 100000,
        stock: stock,
        product_id: product_id,
      })
      .set("Authorization", access_token);

    const { cart_id, user_id, ...products } = resCart.body.data;

    const result = await supertest(app)
      .post("/api/orders")
      .send({
        order: {
          total_amount: 100000,
          logistic: "J&T EXPRESS",
          payment_method: "COD",
          status: "PAYMENT",

          full_name: "FULL NAME TEST",

          address_owner: "OWNER TEST",
          street: "jl.12 rt05/rw04",
          subdistrict: "Northen",
          district: "Northen District",
          province: "Pantura",
          country: "PANTURA KINGDOM",
          postal_code: "12345",
          whatsapp: "0812345678",
        },
        products: [products],
      })
      .set("Authorization", access_token);

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });
});
