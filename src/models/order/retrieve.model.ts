import pool from "../../apps/postgresql.app";
import ErrorResponse from "../../errors/response.error";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import {
  OrderStatus,
  OrderWithProducts,
} from "../../interfaces/order.interface";
import { OrderCache } from "../../cache/order.cache";
import { TransformHelper } from "../../helpers/transform.helper";

export class OrderModelRetrieve {
  static async findById(order_id: string) {
    const client = await pool.connect();
    try {
      let query = `
      WITH cte_order AS (
        SELECT * FROM orders WHERE order_id = $1
      ),
      cte_products_order AS (
        SELECT * FROM products_orders WHERE order_id = $1
      )
      SELECT
        (SELECT json_agg(row_to_json(cte_order.*)) FROM cte_order) AS order,
        (SELECT json_agg(row_to_json(cte_products_order)) FROM cte_products_order) AS products;
      `;

      const result = await client.query(query, [order_id]);

      if (!result.rows[0].order || !result.rows[0].products) {
        throw new ErrorResponse(404, "order or products not found");
      }

      const order: OrderWithProducts = {
        order: result.rows[0].order[0],
        products: result.rows[0].products,
      };

      await OrderCache.cache(order);

      return order;
    } catch (error) {
      throw ErrorHelper.catch("find order by id", error);
    } finally {
      client.release();
    }
  }

  static async findMany(limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const query = `
      SELECT 
          o.*, po.*
      FROM
          orders AS o
      INNER JOIN 
          products_orders AS po ON o.order_id = po.order_id
      ORDER BY
          o.created_at DESC      
      LIMIT $1 OFFSET $2;
      `;

      const result = await client.query(query, [limit, offset]);
      const orders = TransformHelper.orders(result.rows);

      return orders;
    } catch (error) {
      throw ErrorHelper.catch("find orders", error);
    } finally {
      client.release();
    }
  }

  static async findManyByUserId(
    user_id: number,
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();
    try {
      const query = `
      SELECT 
          o.*, po.*
      FROM 
          orders AS o
      INNER JOIN 
          products_orders AS po ON o.order_id = po.order_id
      WHERE 
          o.user_id = $1
      ORDER BY
          o.created_at DESC
      LIMIT $2 OFFSET $3;
      `;

      const result = await client.query(query, [user_id, limit, offset]);
      const orders = TransformHelper.carts(result.rows);

      return orders;
    } catch (error) {
      throw ErrorHelper.catch("find orders by user id", error);
    } finally {
      client.release();
    }
  }

  static async findManyByStatus(
    status: OrderStatus,
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();
    try {
      const query = `
      SELECT 
          o.*, po.*
      FROM
          orders AS o
      INNER JOIN
          products_orders AS po ON o.order_id = po.order_id
      WHERE
          o.status = $1
      ORDER BY
          o.created_at DESC
      LIMIT $2 OFFSET $3;
      `;

      const result = await client.query(query, [status, limit, offset]);
      const orders = TransformHelper.orders(result.rows);

      return orders;
    } catch (error) {
      throw ErrorHelper.catch("find orders by status", error);
    } finally {
      client.release();
    }
  }

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
