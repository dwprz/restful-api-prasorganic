import { PoolClient } from "pg";

export class CategoryTestSubModel {
  static async insert(client: PoolClient, categories: string[]) {
    try {
      const query = `
        INSERT INTO categories(category_name) VALUES ($1) RETURNING category_id;
        `;

      let category_ids: any = [];

      for (const category of categories) {
        const result = await client.query(query, [category]);

        category_ids.push(result.rows[0]);
      }

      return category_ids;
    } catch (error) {
      throw new Error(`category test sub model insert: ${error.message}`);
    }
  }

  static async delete(client: PoolClient, category_id: number) {
    try {
      const query = `
        DELETE FROM categories WHERE category_id = $1
        `;

      const result = await client.query(query, [category_id]);

      return result.rows;
    } catch (error) {
      throw new Error(
        `category test sub model delete: ${error.message}`
      );
    }
  }
}
