import pool from "../apps/postgresql.app";
import ErrorResponse from "../errors/response.error";
import { ErrorHelper } from "../helpers/error.helper";
import { SqlHelper } from "../helpers/sql.helper";
import { Order, OrderWithProducts } from "../interfaces/order.interface";
import { OrderCache } from "../cache/order.cache";

export class OrderUtil {
  static async create(data: OrderWithProducts) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      let field_names = SqlHelper.getFieldNames(data.order);

      let parameterized_queries = SqlHelper.buildParameterizedQueries(
        data.order
      );

      let field_values = SqlHelper.getFieldValues(data.order);

      let query = `
        INSERT INTO 
            orders (${field_names}, created_at, updated_at)
        VALUES 
            (${parameterized_queries}, now(), now())
        RETURNING *;
        `;

      let result = await client.query(query, field_values);
      const order = result.rows[0];
      const order_id = order.order_id;

      let products = [];

      for (const product of data.products) {
        field_names = SqlHelper.getFieldNames(product);
        parameterized_queries = SqlHelper.buildParameterizedQueries(product);
        field_values = SqlHelper.getFieldValues(product);

        query = `
        INSERT INTO
            products_orders (${field_names}, order_id)
        VALUES
            (${parameterized_queries}, $${field_values.length + 1})
        RETURNING *;
        `;

        let result = await client.query(query, [...field_values, order_id]);
        const product_order = result.rows[0];

        products.push(product_order);

        query = `
        SELECT stock FROM products WHERE product_id = $1 FOR UPDATE;
        `;

        result = await client.query(query, [product.product_id]);

        if (!result.rowCount) {
          throw new ErrorResponse(404, "product is not found");
        }

        const current_stock = result.rows[0].stock;
        const stock = current_stock - product.quantity;

        if (stock < 0) {
          throw new ErrorResponse(400, "quantity exceeds product stock");
        }

        query = `
        UPDATE 
            products 
        SET 
            stock = $1
        WHERE 
            product_id = $2 
        RETURNING *;
        `;

        await client.query(query, [stock, product.product_id]);
      }

      await OrderCache.cache({ order, products });

      await client.query("COMMIT TRANSACTION;");

      return { order, products } as OrderWithProducts;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("create order", error);
    } finally {
      client.release();
    }
  }

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

      const order_with_products: OrderWithProducts = {
        order: result.rows[0].order[0],
        products: result.rows[0].products,
      };

      await OrderCache.cache(order_with_products);

      return order_with_products;
    } catch (error) {
      throw ErrorHelper.catch("find order by id", error);
    } finally {
      client.release();
    }
  }

  static async updateById(fields: Record<string, any>, order_id: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      const set_clause = SqlHelper.buildSetClause(fields);
      const field_values = SqlHelper.getFieldValues(fields);

      const query = `
      UPDATE 
        orders 
      SET 
        ${set_clause}
      WHERE 
        order_id = $${field_values.length + 1} 
      RETURNING *;
      `;

      const result = await client.query(query, [...field_values, order_id]);
      const order = result.rows[0] as Order;

      await OrderCache.updateById(fields, order_id);

      await client.query("COMMIT TRANSACTION;");

      return order;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("update order by id", error);
    } finally {
      client.release();
    }
  }
}
