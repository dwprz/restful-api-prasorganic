import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";

export class ProductModelCount {
  static async count() {
    const client = await pool.connect();

    try {
      const query = `SELECT CAST(COUNT(product_id) AS INTEGER) FROM products;`;

      const result = await client.query(query);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw ErrorHelper.catch("count products", error);
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
            products 
        WHERE 
            ${where_clause};`;

      const result = await client.query(query, field_values);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw ErrorHelper.catch(`count products by ${field_names}`, error);
    } finally {
      client.release();
    }
  }

  static async countByName(name: string) {
    const client = await pool.connect();
    try {
      const tsquery_values = name.split(" ").join(" & ");

      const query = `
        SELECT
            CAST(COUNT(product_id) AS INTEGER)
        FROM
            products
        WHERE
            to_tsvector(product_name) @@ to_tsquery($1);
        `;

      const result = await client.query(query, [tsquery_values]);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw ErrorHelper.catch("count products by name", error);
    } finally {
      client.release();
    }
  }

  static async countByCategories(categories: string | string[]) {
    const client = await pool.connect();

    try {
      if (!Array.isArray(categories)) {
        categories = [categories];
      }

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(categories);

      const query = `
        SELECT 
            CAST(COUNT(DISTINCT p.product_id) AS INTEGER)
        FROM
            products AS p
        INNER JOIN
            categories_on_products AS cop ON cop.product_id = p.product_id
        INNER JOIN 
            categories AS c ON c.category_id = cop.category_id
        WHERE 
            c.category_name IN (${parameterized_queries});
        `;

      const result = await client.query(query, categories);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw ErrorHelper.catch("count products by categories", error);
    } finally {
      client.release();
    }
  }
}
