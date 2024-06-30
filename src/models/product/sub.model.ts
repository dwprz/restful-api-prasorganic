import { DatabaseError, PoolClient } from "pg";
import { SqlHelper } from "../../helpers/sql.helper";
import { Product, ProductInput } from "../../interfaces/product.interface";
import ErrorResponse from "../../errors/response.error";

export class ProductSubModel {
  static async insert(client: PoolClient, product: ProductInput) {
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
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ErrorResponse(409, "product name already exists");
      }

      throw error;
    }
  }

  static async updateById(
    client: PoolClient,
    fields: Record<string, any>,
    product_id: number
  ) {
    const set_clause = SqlHelper.buildSetClause(fields);
    const field_values = SqlHelper.getFieldValues(fields);

    const query = `
    UPDATE 
        products 
    SET 
        ${set_clause}, updated_at = now()
    WHERE 
        product_id = $${field_values.length + 1} 
    RETURNING *;
    `;

    await client.query(query, [...field_values, product_id]);
  }

  static async updateRatingAndSold(
    client: PoolClient,
    current_rating: number | null,
    current_sold: number | null,
    data: any
  ) {
    const new_sold = (current_sold || 0) + data.quantity;

    let rating: number;

    if (current_sold) {
      rating =
        current_sold * (current_rating || 0) +
        (data.quantity * data.rating) / new_sold;
    } else {
      rating = data.rating;
    }

    const query = `
    UPDATE 
        products
    SET
        sold = $1, rating = $2, updated_at = now()
    WHERE
        product_id = $3
    RETURNING *;
    `;

    const result = await client.query(query, [
      new_sold,
      rating,
      data.product_id,
    ]);

    return result.rows[0] as Product;
  }

  static async upsert(client: PoolClient, product: Product) {
    const field_names = SqlHelper.getFieldNames(product);
    const field_values = SqlHelper.getFieldValues(product);

    const parameterized_queries = SqlHelper.buildParameterizedQueries(product);

    const query = `
    INSERT INTO 
         products(${field_names}) 
    VALUES
         (${parameterized_queries}) 
    ON CONFLICT
         (product_name) DO NOTHING
    RETURNING *;
    `;

    const result = await client.query(query, field_values);

    if (result.rowCount === 0) {
      throw new ErrorResponse(409, "product name already exists");
    }

    return result.rows[0] as Product;
  }

  static async deleteById(client: PoolClient, product_id: number) {
    const query = `
    DELETE FROM products WHERE product_id = $1 RETURNING *;
    `;

    const result = await client.query(query, [product_id]);

    return result.rows[0] as Product;
  }
}
