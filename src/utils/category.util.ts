import pool from "../apps/postgresql.app";
import ErrorResponse from "../errors/response.error";
import { ErrorHelper } from "../helpers/error.helper";
import { SqlHelper } from "../helpers/sql.helper";

export class CategoryUtil {
  static async update(
    categories: string[],
    new_categories: string[],
    product_id: number
  ) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      const categories_to_be_deleted = categories.filter(
        (category) => !new_categories.includes(category)
      );

      const categories_to_be_added = new_categories.filter(
        (category) => !categories.includes(category)
      );

      if (categories_to_be_deleted.length) {
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
      const categories_ids = result.rows;

      const categories_on_products = categories_ids.map(({ category_id }) => {
        return { category_id, product_id };
      });

      const fieldNames = SqlHelper.getFieldNames(categories_on_products[0]);

      valuesPlaceholders = SqlHelper.buildValuesPlaceholders(
        categories_on_products
      );

      query = `
      INSERT INTO
          categories_on_products (${fieldNames})
      VALUES
          ${valuesPlaceholders}
      ON CONFLICT 
          (category_id, product_id)
      DO UPDATE SET
          category_id = EXCLUDED.category_id, product_id = EXCLUDED.product_id
      RETURNING*;
      `;

      const field_values = SqlHelper.getFieldValues(categories_on_products);

      await client.query(query, field_values);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("update categories", error);
    } finally {
      client.release();
    }
  }
}
