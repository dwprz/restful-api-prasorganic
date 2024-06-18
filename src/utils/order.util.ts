import pool from "../apps/postgresql.app";
import redis from "../apps/redis.app";
import ErrorResponse from "../error/response.error";
import { ErrorHelper } from "../helpers/error.helper";
import { SqlHelper } from "../helpers/sql.helper";
import { Order, OrderWithProducts } from "../interfaces/order.interface";

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
            (${parameterized_queries}, '${order_id}')
        RETURNING *;
        `;

        let result = await client.query(query, field_values);
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
        UPDATE products SET stock = $1
        WHERE product_id = $2 RETURNING *;
        `;

        await client.query(query, [stock, product.product_id]);
      }

      await this.createCache({ order, products });

      await client.query("COMMIT TRANSACTION;");

      return { order, products };
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("create order", error);
    } finally {
      client.release();
    }
  }

  static async createCache(data: OrderWithProducts) {
    try {
      const order_id = data.order.order_id;

      await redis.setex(
        `order_id:${order_id}`,
        3600 * 24 * 7,
        JSON.stringify(data)
      );
    } catch (error) {
      throw ErrorHelper.catch("create order cache", error);
    }
  }

  static async findCacheById(order_id: string) {
    try {
      const order = await redis.get(`order_id:${order_id}`);

      if (!order) {
        return null;
      }

      return JSON.parse(order) as OrderWithProducts;
    } catch (error) {
      throw ErrorHelper.catch("finda order cache by id", error);
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

      await this.updateCacheById(fields, order_id);

      await client.query("COMMIT TRANSACTION;");

      return order;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("update order by id", error);
    } finally {
      client.release();
    }
  }

  static async updateCacheById(fields: Record<string, any>, order_id: string) {
    try {
      const order_cache = await this.findCacheById(order_id);

      if (order_cache) {
        Object.keys(fields).forEach((property) => {
          (order_cache.order as any)[property] = fields[property];
        });

        await this.createCache(order_cache);
      }
    } catch (error) {
      throw ErrorHelper.catch("update order cache by id", error);
    }
  }
}
