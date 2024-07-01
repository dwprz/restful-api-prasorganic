import { PoolClient } from "pg";
import { SqlHelper } from "../../../src/helpers/sql.helper";
import { Product } from "../../../src/interfaces/product.interface";

export class DeletedProductTestSubModel {
  static async insert(client: PoolClient, product: any) {
    try {
      const field_names = SqlHelper.getFieldNames(product);
      const field_values = SqlHelper.getFieldValues(product);

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(product);

      const query = `
      INSERT INTO deleted_products(${field_names}) VALUES(${parameterized_queries}) RETURNING *;
      `;

      const result = await client.query(query, field_values);
      return result.rows[0] as Product;
    } catch (error) {
      throw new Error(
        `deleted product test sub model insert: ${error.message}`
      );
    }
  }

  static async delete(client: PoolClient, product_id: number) {
    try {
      const query = `
      DELETE FROM 
          deleted_products
      WHERE
          product_id = $1;
      `;

      await client.query(query, [product_id]);
    } catch (error) {
      throw new Error(
        `deleted product test sub model delete: ${error.message}`
      );
    }
  }

  static async deleteMany(client: PoolClient, product_ids: number[]) {
    try {
      if (product_ids.length === 0) {
        return;
      }

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(product_ids);

      const field_values = SqlHelper.getFieldValues(product_ids);

      const query = `
      DELETE FROM 
          deleted_products
      WHERE
          product_id IN (${parameterized_queries});
      `;

      await client.query(query, field_values);
    } catch (error) {
      throw new Error(
        `deleted product test sub model delete: ${error.message}`
      );
    }
  }
}
