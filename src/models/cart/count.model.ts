import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";

export class CartModelCount {
  static async count() {
    const client = await pool.connect();

    try {
      const query = `
        SELECT CAST(COUNT(product_id) AS INTEGER) FROM carts;`;

      const result = await client.query(query);
      const total_cart_items = result.rows[0].count;

      return total_cart_items;
    } catch (error) {
      throw ErrorHelper.catch("count cart item", error);
    } finally {
      client.release();
    }
  }

  static async countByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    try {
      const where_clause = SqlHelper.buildWhereClause(fields);
      const field_values = SqlHelper.getFieldValues(fields);

      const query = `
        SELECT 
            CAST(COUNT(product_id) AS INTEGER) 
        FROM 
            carts
        WHERE 
            ${where_clause};`;

      const result = await client.query(query, field_values);
      const total_cart_items = result.rows[0].count;

      return total_cart_items;
    } catch (error) {
      throw ErrorHelper.catch(`count cart item by ${field_names}`, error);
    } finally {
      client.release();
    }
  }

  static async countByProductName(product_name: string) {
    const client = await pool.connect();

    try {
      const tsquery_values = product_name.split(" ").join(" & ");

      const query = `
        SELECT
            CAST(COUNT(p.product_id) AS INTEGER)
        FROM 
            products AS p 
        INNER JOIN 
            carts AS c ON c.product_id = p.product_id 
        WHERE
            to_tsvector(product_name) @@ to_tsquery($1);
        `;

      const result = await client.query(query, [tsquery_values]);
      const total_cart_items = result.rows[0].count;

      return total_cart_items;
    } catch (error) {
      throw ErrorHelper.catch("count cart item by product name", error);
    } finally {
      client.release();
    }
  }
}
