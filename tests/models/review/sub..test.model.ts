import { PoolClient } from "pg";
import { SqlHelper } from "../../../src/helpers/sql.helper";
import { Review } from "../../../src/interfaces/review.interface";

export class ReviewTestSubModel {
  static async insert(client: PoolClient, data: Review) {
    try {
      const field_names = SqlHelper.getFieldNames(data);
      const field_values = SqlHelper.getFieldValues(data);

      const parameterized_queries = SqlHelper.buildParameterizedQueries(data);

      const query = `
      INSERT INTO
          reviews(${field_names}, created_at)
      VALUES
          (${parameterized_queries}, now())
      ON CONFLICT
          (user_id, product_id) DO NOTHING
      RETURNING *;
      `;

      const result = await client.query(query, field_values);

      return result.rows[0] as Review;
    } catch (error) {
      throw new Error(`review test sub model insert: ${error.message}`);
    }
  }

  // static async delete(client: PoolClient, user_id: number, product_id: number) {
  //   try {
  //     let query = `
  //     DELETE FROM reviews WHERE user_id = $1 AND product_id = $2;
  //     `;

  //     await client.query(query, [user_id, product_id]);
  //   } catch (error) {
  //     throw new Error(`review test sub model delete: ${error.message}`);
  //   }
  // }
}
