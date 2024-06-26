import { PoolClient } from "pg";
import { SqlHelper } from "../../helpers/sql.helper";

export class CategoryOnDeletedProductSubModel {
  static async upsert(
    client: PoolClient,
    categories_on_product: Record<string, number>[]
  ) {
    const field_names = SqlHelper.getFieldNames(categories_on_product[0]);
    const field_values = SqlHelper.getFieldValues(categories_on_product);

    const values_placeholders = SqlHelper.buildValuesPlaceholders(
      categories_on_product
    );

    const query = `
    INSERT INTO 
        categories_on_deleted_products(${field_names})
    VALUES 
        ${values_placeholders}
    ON CONFLICT
        (category_id, product_id)
    DO UPDATE SET
        category_id = EXCLUDED.category_id, product_id = EXCLUDED.product_id
    RETURNING *;
    `;

    await client.query(query, field_values);
  }

  static async deleteById(client: PoolClient, product_id: number) {
    const query = `
    DELETE FROM 
         categories_on_deleted_products 
    WHERE 
         product_id = $1 
    RETURNING *;
    `;

    const result = await client.query(query, [product_id]);
    return result.rows;
  }
}
