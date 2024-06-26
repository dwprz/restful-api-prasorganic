import pool from "../../src/apps/postgresql.app";
import { SqlHelper } from "../../src/helpers/sql.helper";
import {
  Order,
  OrderStatus,
  ProductOrder,
} from "../../src/interfaces/order.interface";

export class OrderTestUtil {
  private static order = {
    gross_amount: 50000,
    courier: "JNE",
    rate_id: 1,
    rate_name: "REG",
    rate_type: "Regular",
    cod: false,
    use_insurance: true,
    package_type: 3,
    payment_method: "ABC",
    snap_token: "rahasia",
    snap_redirect_url: "rahasia",
    email: "userTest123@gmail.com",
    buyer: "User Test123",
    length: 30,
    width: 15,
    height: 15,
    weight: 5,
    address_owner: "John Doe",
    street: "Gang Kancil no.xx",
    area_id: 4739,
    area: "Ragunan",
    lat: "-6.301752",
    lng: "106.8207875",
    suburb: "Pasar Minggu",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    whatsapp: "08123456789",
    created_at: "2024-06-21T06:31:22.356Z",
  };

  private static products_order = [
    {
      product_id: 1,
      product_name: "PRODUCT TEST",
      image: "IMAGE TEST",
      price: 20000,
      quantity: 10,
      total_gross_price: 200000,
    },
  ];

  static async create(user_id: number, order_id: string, status: OrderStatus) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      const field_names = SqlHelper.getFieldNames(this.order);
      const parameterized_queries = SqlHelper.buildParameterizedQueries(
        this.order
      );
      const field_values = SqlHelper.getFieldValues(this.order);

      let query = `
      INSERT INTO 
          orders(${field_names}, order_id, status, user_id, updated_at) 
      VALUES
          (${parameterized_queries}, '${order_id}', '${status}', ${user_id}, now()) 
      RETURNING *;
      `;

      const result = await client.query(query, field_values);
      const order = result.rows[0] as Order;

      let products: ProductOrder[] = [];

      for (const product of this.products_order) {
        const field_names = SqlHelper.getFieldNames(product);

        const parameterized_queries =
          SqlHelper.buildParameterizedQueries(product);

        const field_values = SqlHelper.getFieldValues(product);

        query = `
        INSERT INTO 
            products_orders(${field_names}, order_id)
        VALUES
            (${parameterized_queries}, '${order.order_id}')
        RETURNING *;
        `;

        const result = await client.query(query, field_values);
        products.push(result.rows[0]);
      }

      await client.query("COMMIT TRANSACTION;");

      return { order, products };
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("this error create order util", error);
    } finally {
      client.release();
    }
  }

  static async delete(order_id: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      let query = `
      DELETE FROM products_orders WHERE order_id = '${order_id}'; 
      `;

      await client.query(query);

      query = `
      DELETE FROM orders WHERE order_id = '${order_id}';
      `;

      await client.query(query);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("this order util error:", error);
    } finally {
      client.release();
    }
  }
}
