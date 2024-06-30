import { PoolClient } from "pg";

interface CategoryOnProduct {
  product_id: number;
  category_id: number;
}

export class CategoryOnProductTestSubModel {
  static async insert(client: PoolClient, data: CategoryOnProduct[]) {
    try {
      const query = `
        INSERT INTO categories_on_products(product_id, category_id) VALUES ($1, $2);
        `;

      for (const { product_id, category_id } of data) {
        await client.query(query, [product_id, category_id]);
      }
    } catch (error) {
      throw new Error(`category test sub model insert: ${error.message}`);
    }
  }

  static async delete(client: PoolClient, product_id: number) {
    try {
      const query = `
        DELETE FROM 
            categories_on_products 
        WHERE 
            product_id = $1
        RETURNING 
            category_id;
        `;

      const result = await client.query(query, [product_id]);

      return result.rows;
    } catch (error) {
      throw new Error(
        `category on product test sub model delete: ${error.message}`
      );
    }
  }
}
