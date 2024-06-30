import { PoolClient } from "pg";
import { SqlHelper } from "../../../src/helpers/sql.helper";
import { ProductOrder } from "../../../src/interfaces/order.interface";

export class ProductOrderTestSubModel {
  static async insert(
    client: PoolClient,
    product_order: any,
    order_id: string
  ) {
    try {
      const field_names = SqlHelper.getFieldNames(product_order);
      const field_values = SqlHelper.getFieldValues(product_order);

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(product_order);

      const query = `
        INSERT INTO
            products_orders (${field_names}, order_id)
        VALUES
            (${parameterized_queries}, $${field_values.length + 1})
        RETURNING *;
        `;

      const result = await client.query(query, [...field_values, order_id]);

      return result.rows[0] as ProductOrder;
    } catch (error) {
      throw new Error(`product order test sub model: ${error.message}`);
    }
  }

  static async delete(client: PoolClient, order_id: string) {
    try {
      let query = `
      DELETE FROM products_orders WHERE order_id = $1;
      `;

      await client.query(query, [order_id]);
    } catch (error) {
      throw new Error(`product order test sub model: ${error.message}`);
    }
  }
}
