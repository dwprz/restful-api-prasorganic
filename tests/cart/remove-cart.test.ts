import supertest from "supertest";
import { productUtil } from "../product/product.util";
import { userUtil } from "../user/user.util";
import app from "../../src/apps/app/app";
import { cartUtil } from "./cart.util";

// npx jest tests/cart/remove-cart.test.ts
const authSecret = process.env.AUTHORIZATION_SECRET;

describe("DELETE /api/carts/:cartId", () => {
  beforeEach(async () => await userUtil.create());
  beforeEach(async () => await productUtil.create());

  afterEach(async () => await cartUtil.remove());
  afterEach(async () => await productUtil.remove());
  afterEach(async () => await userUtil.remove());

  it("should be successful remove cart", async () => {
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

    const resAddToCart = await supertest(app)
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

    const cart_id = resAddToCart.body.data.cart_id;

    const result = await supertest(app)
      .delete(`/api/carts/${cart_id}`)
      .set("Authorization", access_token);

    expect(result.status).toBe(200);
    expect(result.body.message).toBeDefined();
  });

  it("should fail if cart not found", async () => {
    const resLogin = await supertest(app)
      .post("/api/users/login")
      .send({
        username: "USER TEST",
        password: "PASSWORD TEST",
      })
      .set("Authorization", authSecret!);

    const access_token = resLogin.body.access_token;
    const missingCartId = 0;

    const result = await supertest(app)
      .delete(`/api/carts/${missingCartId}`)
      .set("Authorization", access_token);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });
});
