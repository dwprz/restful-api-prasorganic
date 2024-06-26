import { DatabaseError, PoolClient } from "pg";
import { Product } from "../../interfaces/product.interface";
import { SqlHelper } from "../../helpers/sql.helper";
import ErrorResponse from "../../errors/response.error";

export class DeletedProductSubModel {
  static async insert(client: PoolClient, product: Product) {
    try {
      const field_names = SqlHelper.getFieldNames(product);
      const field_values = SqlHelper.getFieldValues(product);

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(product);

      const query = `
      INSERT INTO 
           deleted_products(${field_names})
      VALUES 
           (${parameterized_queries})
      RETURNING *;
      `;

      await client.query(query, field_values);

    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === "23505") {
          throw new ErrorResponse(409, "deleted product already exists");
        }

        throw error;
      }
    }
  }

  static async deleteById(client: PoolClient, product_id: number) {
    const query = `
    DELETE FROM 
         deleted_products 
    WHERE 
         product_id = $1 
    RETURNING *;
    `;

    const result = await client.query(query, [product_id]);
    return result.rows[0] as Product;
  }
}
