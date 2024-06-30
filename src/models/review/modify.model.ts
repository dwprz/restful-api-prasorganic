import pool from "../../apps/postgresql.app";
import { ReviewHighlightCache } from "../../cache/review-highlight.cache";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import { ReviewInput } from "../../interfaces/review.interface";
import { ProductSubModel } from "../product/sub.model";
import { ReviewSubModel } from "./sub.model";

export class ReviewModelModify {
  static async create(reviewInputs: ReviewInput[]) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      for (const data of reviewInputs) {
        let query = `
        SELECT rating, sold FROM products WHERE product_id = $1 FOR UPDATE;
        `;

        let result = await client.query(query, [data.product_id]);
        const { rating, sold } = result.rows[0];

        await ProductSubModel.updateRatingAndSold(client, rating, sold, data);

        const { quantity, ...rest } = data;
        await ReviewSubModel.insert(client, rest);
      }

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("create review", error);
    } finally {
      client.release();
    }
  }

  static async updateByFields(
    fields: Record<string, any>,
    user_id: number,
    product_id: number
  ) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    try {
      await client.query("BEGIN TRANSACTION;");

      const field_values = SqlHelper.getFieldValues(fields);
      const set_clause = SqlHelper.buildSetClause(fields);

      const query = `
        UPDATE 
            reviews       
        SET
            ${set_clause}
        WHERE
            user_id = $${field_values.length + 1}
            AND
            product_id = $${field_values.length + 2}
        RETURNING *;
      `;

      const result = await client.query(query, [
        ...field_values,
        user_id,
        product_id,
      ]);

      await ReviewHighlightCache.update(result.rows[0]);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch(`update review by ${field_names}`, error);
    } finally {
      client.release();
    }
  }
}
