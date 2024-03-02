import supertest from "supertest";
import { utilProduct } from "./utilProduct";
import app from "../../src/applications/app";

// describe("POST /api/products", () => {
//   afterEach(async () => await utilProduct.remove());

//   it("should be successful add product", async () => {
//     const result = await supertest(app)
//       .post("/api/products")
//       .field("name", "productTest")
//       .field("initial_price", 25000)
//       .field("stock", 35000)
//       .field("category", "fruits")
//       .field(
//         "description",
//         `Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
//          Quam magni omnis explicabo, maxime ratione quae hic modi 
//          nostrum quisquam, qui eligendi accusamus quis aspernatur 
//          repellat.`
//       )
//       .attach("image", __dirname + "/assets/strawbery.jpg")
//       .set("authorization", process.env.AUTHORIZATION_ADMIN_SECRET!);

//     console.log(result.body);
//     expect(result.status).toBe(200);
//   });
// });

describe("GET /api/products", () => {
  it("should be successful get all product", async () => {
    const result = await supertest(app).get("/api/products?category=grains&page=1");
    console.log(result.status);
    console.log(result.body);
  });
});
