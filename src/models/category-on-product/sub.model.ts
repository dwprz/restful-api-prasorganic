import { PoolClient } from "pg";
import { SqlHelper } from "../../helpers/sql.helper";

export class CategoryOnProductSubModel {
  static async upsert(
    client: PoolClient,
    categories_on_product: Record<string, number>[]
  ) {
    const fieldNames = SqlHelper.getFieldNames(categories_on_product[0]);
    const field_values = SqlHelper.getFieldValues(categories_on_product);

    const valuesPlaceholders = SqlHelper.buildValuesPlaceholders(
      categories_on_product
    );

    const query = `
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

    await client.query(query, field_values);
  }

  static async deleteById(client: PoolClient, product_id: number) {
    const query = `
    DELETE FROM 
        categories_on_products 
    WHERE 
        product_id = $1 
    RETURNING 
        category_id;
    `;

    const result = await client.query(query, [product_id]);

    const categories_on_product = result.rows.map(({ category_id }) => {
      return { category_id, product_id };
    });

    return categories_on_product;
  }
}
