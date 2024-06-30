import pool from "../../apps/postgresql.app";
import { ReviewHighlightCache } from "../../cache/review-highlight.cache";
import { ErrorHelper } from "../../helpers/error.helper";
import { Review, ReviewOutput } from "../../interfaces/review.interface";

export class ReviewModelRetrieve {
  static async findMany(limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
            r.*, p.product_name, p.is_top_product, p.image AS product_image
        FROM
            reviews AS r
        INNER JOIN
            products AS p ON r.product_id = p.product_id
        LIMIT $1 OFFSET $2;
        `;

      const result = await client.query(query, [limit, offset]);

      return result.rows as ReviewOutput[];
    } catch (error) {
      throw ErrorHelper.catch("get reviews", error);
    } finally {
      client.release();
    }
  }

  static async findManyByRating(rating: number, limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
            r.*, p.product_name, p.is_top_product, p.image AS product_image
        FROM
            reviews AS r
        INNER JOIN
            products AS p ON r.product_id = p.product_id
        WHERE
            r.rating >= $1 AND r.rating < $1 + 1
        LIMIT $2 OFFSET $3;
        `;

      const result = await client.query(query, [rating, limit, offset]);

      return result.rows as ReviewOutput[];
    } catch (error) {
      throw ErrorHelper.catch("get reviews by rating", error);
    } finally {
      client.release();
    }
  }

  static async findManyByProductName(
    product_name: string,
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();
    try {
      const query = `
        WITH cte_product AS (
            SELECT product_id FROM products WHERE LOWER(product_name) = LOWER($1)
        )
        SELECT 
            r.*, p.product_name, p.is_top_product, p.image AS product_image
        FROM 
            reviews AS r
        INNER JOIN
            products AS p ON r.product_id = p.product_id
        WHERE
            r.product_id = (SELECT product_id FROM cte_product)
        LIMIT $2 OFFSET $3;
        `;

      const result = await client.query(query, [product_name, limit, offset]);
      return result.rows as ReviewOutput[];
    } catch (error) {
      throw ErrorHelper.catch("get reviews by product name", error);
    } finally {
      client.release();
    }
  }

  static async findManyByHighlight() {
    const client = await pool.connect();
    try {
      const query = `
      SELECT * FROM reviews WHERE is_highlight = TRUE;
      `;

      const result = await client.query(query);
      const reviews = result.rows as Review[];

      await ReviewHighlightCache.cache(reviews);
      return reviews;
    } catch (error) {
      throw ErrorHelper.catch("get highlighted reviews", error);
    } finally {
      client.release();
    }
  }
}
