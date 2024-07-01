import { PoolClient } from "pg";
import { CategoryOnDeletedProduct } from "../../../src/interfaces/category.interfcae";
import { SqlHelper } from "../../../src/helpers/sql.helper";

export class CategoryOnDeletedProductTestSubModel {
  static async insert(client: PoolClient, data: CategoryOnDeletedProduct) {
    try {
      const query = `
        INSERT INTO 
            categories_on_deleted_products(product_id, category_id)
        VALUES
            ($1, $2);
        `;

      await client.query(query, [data.product_id, data.category_id]);
    } catch (error) {
      throw new Error(`category on deleted product insert: ${error.message}`);
    }
  }

  static async delete(client: PoolClient, product_id: number) {
    try {
      const query = `
        DELETE FROM 
            categories_on_deleted_products
        WHERE
            product_id = $1
        RETURNING category_id;
        `;

      const result = await client.query(query, [product_id]);
      const category_ids = result.rows.map(({ category_id }) => category_id);

      return category_ids;
    } catch (error) {
      throw new Error(`category on deleted product delete: ${error.message}`);
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
            categories_on_deleted_products
        WHERE
            product_id IN (${parameterized_queries})
        RETURNING category_id;
        `;

      const result = await client.query(query, field_values);
      const category_ids = result.rows.map(({ category_id }) => category_id);

      return category_ids;
    } catch (error) {
      throw new Error(`category on deleted product delete: ${error.message}`);
    }
  }
}
