import { PoolClient } from "pg";
import { Order } from "../../../src/interfaces/order.interface";
import { SqlHelper } from "../../../src/helpers/sql.helper";

export class OrderTestSubModel {
  static async insert(client: PoolClient, order: Order) {
    try {
      const field_names = SqlHelper.getFieldNames(order);
      const field_values = SqlHelper.getFieldValues(order);

      const parameterized_queries = SqlHelper.buildParameterizedQueries(order);

      const query = `
        INSERT INTO 
            orders (${field_names}, created_at)
        VALUES 
            (${parameterized_queries}, now())
        RETURNING *;
        `;

      const result = await client.query(query, field_values);

      return result.rows[0] as Order;
    } catch (error) {
      throw new Error(`order test sub model insert: ${error.message}`);
    }
  }

  static async delete(client: PoolClient, order_id: string) {
    try {
      const query = `
      DELETE FROM orders WHERE order_id = $1;
      `;

      await client.query(query, [order_id]);
    } catch (error) {
      throw new Error(`order test sub model delete: ${error.message}`);
    }
  }
}
