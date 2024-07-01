import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";

export class DeletedProductModelCount {
  static async count() {
    const client = await pool.connect();
    try {
      const query = `SELECT CAST(COUNT(product_id) AS INTEGER) FROM deleted_products;`;

      const result = await client.query(query);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw ErrorHelper.catch("count deleted products", error);
    } finally {
      client.release();
    }
  }
}
