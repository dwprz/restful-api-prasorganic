import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";

export class DeletedProductModelRetrieve {
  static async findMany(limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const query = `SELECT * FROM deleted_products LIMIT ${limit} OFFSET ${offset}`;

      const result = await client.query(query);
      const products = result.rows;

      return products;
    } catch (error) {
      throw ErrorHelper.catch("get deleted products", error);
    } finally {
      client.release();
    }
  }
}
