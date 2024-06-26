import { PoolClient } from "pg";
import { SqlHelper } from "../../helpers/sql.helper";
import { ProductOrder } from "../../interfaces/order.interface";

export class ProductOrderSubModel {
  static async insert(
    client: PoolClient,
    data: ProductOrder,
    order_id: string
  ) {
    const field_names = SqlHelper.getFieldNames(data);
    const parameterized_queries = SqlHelper.buildParameterizedQueries(data);

    const field_values = SqlHelper.getFieldValues(data);

    const query = `
    INSERT INTO
        products_orders (${field_names}, order_id)
    VALUES
        (${parameterized_queries}, $${field_values.length + 1})
    RETURNING *;
    `;

    const result = await client.query(query, [...field_values, order_id]);

    return result.rows[0];
  }
}
