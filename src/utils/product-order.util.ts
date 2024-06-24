import pool from "../apps/postgresql.app";
import ErrorResponse from "../errors/response.error";
import { ErrorHelper } from "../helpers/error.helper";
import { ProductOrder } from "../interfaces/order.interface";

export class ProductOrderUtil {
  static async findManyById(order_id: string) {
    const client = await pool.connect();
    try {
      const query = `SELECT * FROM products_orders WHERE order_id = $1;`;

      const result = await client.query(query, [order_id]);
      const order = result.rows as ProductOrder[];

      if (!order.length) {
        throw new ErrorResponse(404, "products order not found");
      }

      return order;
    } catch (error) {
      throw ErrorHelper.catch("find products order by id", error);
    } finally {
      client.release();
    }
  }
}
