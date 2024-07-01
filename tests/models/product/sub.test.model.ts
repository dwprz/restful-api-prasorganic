import { PoolClient } from "pg";
import { SqlHelper } from "../../../src/helpers/sql.helper";
import { Product } from "../../../src/interfaces/product.interface";

export class ProductTestSubModel {
  static async insert(client: PoolClient, product: any) {
    try {
      const field_names = SqlHelper.getFieldNames(product);
      const field_values = SqlHelper.getFieldValues(product);

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(product);

      const query = `
        INSERT INTO 
            products(${field_names}, created_at)
        VALUES
            (${parameterized_queries}, now())
        RETURNING *;    
        `;

      const result = await client.query(query, field_values);

      return result.rows[0] as Product;
    } catch (error) {
      throw new Error(`product test sub model insert: ${error.message}`);
    }
  }

  static async delete(client: PoolClient, product_id: number) {
    try {
      const query = `DELETE FROM products WHERE product_id = $1;`;

      await client.query(query, [product_id]);
    } catch (error) {
      throw new Error(`product test sub model delete: ${error.message}`);
    }
  }

  static async deleteMany(client: PoolClient, product_ids: number[]) {
    try {
      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(product_ids);

      const query = `
      DELETE FROM products WHERE product_id IN (${parameterized_queries});
      `;

      await client.query(query, product_ids);
    } catch (error) {
      throw new Error(`product test sub model delete many: ${error.message}`);
    }
  }
}
