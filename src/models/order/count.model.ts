import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";

export class OrderModelCount {
  static async count() {
    const client = await pool.connect();
    try {
      const query = `SELECT CAST(COUNT(order_id) AS INTEGER) AS total_orders FROM orders; `;

      const result = await client.query(query);
      const { total_orders } = result.rows[0];

      return total_orders;
    } catch (error) {
      throw ErrorHelper.catch("count orders", error);
    } finally {
      client.release();
    }
  }

  static async countByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    try {
      const where_clauses = SqlHelper.buildWhereClause(fields);
      const field_values = SqlHelper.getFieldValues(fields);

      const query = `
        SELECT 
            CAST(COUNT(order_id) AS INTEGER) AS total_orders
        FROM 
            orders 
        WHERE 
            ${where_clauses};
        `;

      const result = await client.query(query, field_values);
      const { total_orders } = result.rows[0];

      return total_orders;
    } catch (error) {
      throw ErrorHelper.catch(`count orders by ${field_names}`, error);
    } finally {
      client.release();
    }
  }
}
