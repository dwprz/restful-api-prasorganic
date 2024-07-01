import { PoolClient } from "pg";
import { SqlHelper } from "../../../src/helpers/sql.helper";

export class CategoryTestSubModel {
  static async upsert(client: PoolClient, categories: string[]) {
    try {
      const values_placeholders = SqlHelper.buildValuesPlaceholders(categories);

      const query = `
        INSERT INTO 
            categories(category_name) 
        VALUES 
            ${values_placeholders}
        ON CONFLICT
            (category_name)
        DO UPDATE SET
            category_name = EXCLUDED.category_name
        RETURNING 
            category_id;
        `;

      const result = await client.query(query, categories);
      const category_ids = result.rows.map(({ category_id }) => category_id);

      return category_ids;
    } catch (error) {
      throw new Error(`category test sub model insert: ${error.message}`);
    }
  }

  static async delete(client: PoolClient, category_id: number) {
    try {
      const query = `
        DELETE FROM categories WHERE category_id = $1;
        `;

      const result = await client.query(query, [category_id]);

      return result.rows;
    } catch (error) {
      throw new Error(`category test sub model delete: ${error.message}`);
    }
  }

  static async deleteMany(client: PoolClient, category_ids: number[]) {
    try {
      if (category_ids.length === 0) {
        return;
      }

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(category_ids);

      const query = `
      DELETE FROM categories WHERE category_id IN (${parameterized_queries});
      `;

      await client.query(query, category_ids);
    } catch (error) {
      throw new Error(`category test sub model delete many: ${error.message}`);
    }
  }
}
