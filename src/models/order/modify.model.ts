import pool from "../../apps/postgresql.app";
import { OrderCache } from "../../cache/order.cache";
import ErrorResponse from "../../errors/response.error";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import { Order, OrderWithProducts } from "../../interfaces/order.interface";
import { ProductOrderSubModel } from "../product-order/sub.model";
import { ProductSubModel } from "../product/sub.model";
import { OrderSubModel } from "./sub.model";

export class OrderModelModify {
  static async create(data: OrderWithProducts) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      const order = await OrderSubModel.insert(client, data);
      const order_id = order.order_id;

      let products = [];

      for (const product of data.products) {
        const product_order = await ProductOrderSubModel.insert(
          client,
          product,
          order_id!
        );

        products.push(product_order);

        const query = `
        SELECT stock FROM products WHERE product_id = $1 FOR UPDATE;
        `;

        const result = await client.query(query, [product.product_id]);

        if (!result.rowCount) {
          throw new ErrorResponse(404, "product is not found");
        }

        const current_stock = result.rows[0].stock;
        const stock = current_stock - product.quantity;

        if (stock < 0) {
          throw new ErrorResponse(400, "quantity exceeds product stock");
        }

        await ProductSubModel.updateById(
          client,
          { stock: stock },
          product.product_id
        );
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
        ${set_clause}, updated_at = now()
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
