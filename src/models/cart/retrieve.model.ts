import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import { TransformHelper } from "../../helpers/transform.helper";

export class CartModelRetrieve {
  static async findMany(limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const query = `
      WITH unique_products AS (
        SELECT 
            product_id
        FROM
            products
        LIMIT ${limit} OFFSET ${offset}
      )
      SELECT 
          c.*, p.product_name, p.image, p.rate, p.sold, p.price, p.stock, p.length, p.width, p.height, 
          p.weight, p.description, p.created_at, p.updated_at, u.email, u.photo_profile, u.role 
      FROM 
          products AS p
      INNER JOIN
          carts AS c ON c.product_id = p.product_id
      INNER JOIN 
          users AS u ON u.user_id = c.user_id
      WHERE 
          p.product_id IN (SELECT * FROM unique_products);
      `;

      const result = await client.query(query);
      const carts = TransformHelper.carts(result.rows);

      return carts;
    } catch (error) {
      throw ErrorHelper.catch("find carts", error);
    } finally {
      client.release();
    }
  }

  static async findManyByUserId(user_id: number) {
    const client = await pool.connect();

    try {
      let query = `
      SELECT 
          c.*, p.product_name, p.image, p.rate, p.sold, p.price, p.stock, p.length, p.width, p.height,
          p.weight, p.description, p.created_at, p.updated_at
      FROM 
          products AS p 
      INNER JOIN 
          carts AS c ON c.product_id = p.product_id 
      WHERE 
          c.user_id = ${user_id};`;

      const result = await client.query(query);
      const cart = result.rows;

      return cart;
    } catch (error) {
      throw ErrorHelper.catch("find carts by user id", error);
    } finally {
      client.release();
    }
  }

  static async findManyByProductName(
    product_name: string,
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();

    try {
      const tsquery_values = product_name.split(" ").join(" & ");

      const query = `
      WITH unique_products AS (
        SELECT
            p.product_id
        FROM 
            products AS p 
        INNER JOIN 
            carts AS c ON c.product_id = p.product_id 
        WHERE
            to_tsvector(product_name) @@ to_tsquery($1)
        LIMIT ${limit} OFFSET ${offset}
      )
      SELECT 
          c.*, p.product_name, p.image, p.rate, p.sold, p.price, p.stock, p.length, p.width, p.height,
          p.weight, p.description, p.created_at, p.updated_at, u.email, u.photo_profile, u.role 
      FROM 
          products AS p
      INNER JOIN
          carts AS c ON c.product_id = p.product_id
      INNER JOIN 
          users AS u ON u.user_id = c.user_id
      WHERE 
          p.product_id IN (SELECT * FROM unique_products);
      `;

      const result = await client.query(query, [tsquery_values]);
      const carts = TransformHelper.carts(result.rows);

      return carts;
    } catch (error) {
      throw ErrorHelper.catch("find carts by product name", error);
    } finally {
      client.release();
    }
  }

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
