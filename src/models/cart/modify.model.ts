import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import { CartDelete, CartInput } from "../../interfaces/cart.interface";

export class CartModelModify {
  static async create(data: CartInput) {
    const client = await pool.connect();
    try {
      const field_names = SqlHelper.getFieldNames(data);
      const parametized_queries = SqlHelper.buildParameterizedQueries(data);
      const field_values = SqlHelper.getFieldValues(data);

      let query = `
        INSERT INTO 
            carts(${field_names}) 
        VALUES 
            (${parametized_queries}) 
        ON CONFLICT
            (user_id, product_id) DO NOTHING
        RETURNING *;
        `;

      let result = await client.query(query, field_values);
      const cart_item = result.rows[0];

      if (!cart_item) {
        return null;
      }

      query = `
        SELECT 
            product_name, image, rating, sold, price, stock, length, width, height, weight,
            description, created_at, updated_at
        FROM
            products 
        WHERE
            product_id = ${data.product_id};
        `;

      result = await client.query(query);
      const product = result.rows[0];

      return { ...cart_item, ...product };
    } catch (error) {
      throw ErrorHelper.catch("create cart", error);
    } finally {
      client.release();
    }
  }

  static async deleteByUserAndItemId(data: CartDelete) {
    const client = await pool.connect();

    try {
      const query = `
      DELETE FROM 
          carts 
      WHERE 
          user_id = ${data.user_id} 
          AND 
          cart_item_id = ${data.cart_item_id};
      `;

      await client.query(query);
    } catch (error) {
      throw ErrorHelper.catch("delete cart item by user and item id", error);
    } finally {
      client.release();
    }
  }
}
