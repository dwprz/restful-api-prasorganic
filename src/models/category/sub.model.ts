import { PoolClient } from "pg";
import { SqlHelper } from "../../helpers/sql.helper";

export class CategorySubModel {
  static async deleteByNames(
    client: PoolClient,
    categories_to_be_deleted: string[],
    product_id: number
  ) {
    const parameterizedQueries = SqlHelper.buildParameterizedQueries(
      categories_to_be_deleted
    );

    const query = `
    DELETE FROM 
        categories_on_products 
    WHERE 
        category_id IN (
          SELECT 
              category_id
          FROM 
              categories
          WHERE
              category_name IN (${parameterizedQueries})    
        )
        AND
        product_id = $${categories_to_be_deleted.length + 1};
    `;

    await client.query(query, [...categories_to_be_deleted, product_id]);
  }

  static async upsert(client: PoolClient, categories_to_be_added: string[]) {
    let valuesPlaceholders = SqlHelper.buildValuesPlaceholders(
      categories_to_be_added
    );

    let query = `
      INSERT INTO 
          categories (category_name)
      VALUES
          ${valuesPlaceholders}
      ON CONFLICT
          (category_name)
      DO UPDATE SET
          category_name = EXCLUDED.category_name
      RETURNING 
          category_id;
      `;

    let result = await client.query(query, categories_to_be_added);
    const category_ids = result.rows;

    return category_ids;
  }
}
