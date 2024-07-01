import { PoolClient } from "pg";
import { SqlHelper } from "../../helpers/sql.helper";
import { Review } from "../../interfaces/review.interface";

export class ReviewSubModel {
  static async insert(client: PoolClient, data: Review) {
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
  }
}
