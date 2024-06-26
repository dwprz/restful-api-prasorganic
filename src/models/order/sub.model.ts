import { PoolClient } from "pg";
import { SqlHelper } from "../../helpers/sql.helper";
import { Order, OrderWithProducts } from "../../interfaces/order.interface";

export class OrderSubModel {
  static async insert(client: PoolClient, data: OrderWithProducts) {
    const field_names = SqlHelper.getFieldNames(data.order);
    const field_values = SqlHelper.getFieldValues(data.order);

    const parameterized_queries = SqlHelper.buildParameterizedQueries(
      data.order
    );

    const query = `
    INSERT INTO 
        orders (${field_names}, created_at)
    VALUES 
        (${parameterized_queries}, now())
    RETURNING *;
    `;

    const result = await client.query(query, field_values);

    return result.rows[0] as Order;
  }

  static async updateById(client: PoolClient, fields: any, order_id: string) {
    const set_clause = SqlHelper.buildSetClause(fields);
    const field_values = SqlHelper.getFieldValues(fields);

    const query = `
    UPDATE 
        orders 
    SET 
        ${set_clause}, updated_at = now()
    WHERE 
        order_id = ${field_values.length + 1};
    `;

    const result = await client.query(query, [...field_values, order_id]);

    return result.rows[0];
  }
}
