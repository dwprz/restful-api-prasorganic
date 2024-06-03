import supertest from "supertest";
import { productUtil } from "../product/product.util";
import { userUtil } from "../user/user.util";
import app from "../../src/apps/app/app";
import { cartUtil } from "./cart.util";

// npx jest tests/cart/add-to-cart.test.ts
const authSecret = process.env.AUTHORIZATION_SECRET;

describe("POST /api/carts", () => {
  beforeEach(async () => await userUtil.create());
  beforeEach(async () => await productUtil.create());

  afterEach(async () => await cartUtil.remove());
  afterEach(async () => await productUtil.remove());
  afterEach(async () => await userUtil.remove());

  it("should be successful add to cart", async () => {
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

    const result = await supertest(app)
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

    expect(result.status).toBe(200);
    expect(result.body.data).toBeDefined();
  });
});
