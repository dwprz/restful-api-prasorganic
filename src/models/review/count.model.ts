import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";

export class ReviewModelCount {
  static async count() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT CAST(COUNT(*) AS INTEGER) AS total_reviews FROM reviews;
        `;

      const result = await client.query(query);

      return result.rows[0].total_reviews;
    } catch (error) {
      throw ErrorHelper.catch("count reviews", error);
    } finally {
      client.release();
    }
  }

  static async countByRating(rating: number) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
            CAST(COUNT(*) AS INTEGER) AS total_reviews
        FROM
            reviews
        WHERE
            rating >= $1 AND rating < $1 + 1;
        `;

      const result = await client.query(query, [rating]);

      return result.rows[0].total_reviews;
    } catch (error) {
      throw ErrorHelper.catch("count reviews by rating", error);
    } finally {
      client.release();
    }
  }

  static async countByProductName(product_name: string) {
    const client = await pool.connect();
    try {
      const query = `
        WITH cte_product AS (
            SELECT product_id FROM products WHERE LOWER(product_name) = LOWER($1)
        )
        SELECT 
            CAST(COUNT(*) AS INTEGER) AS total_reviews
        FROM 
            reviews AS r
        INNER JOIN
            products AS p ON r.product_id = p.product_id
        WHERE
            r.product_id = (SELECT product_id FROM cte_product);
        `;

      const result = await client.query(query, [product_name]);

      return result.rows[0].total_reviews;
    } catch (error) {
      throw ErrorHelper.catch("count reviews by product name", error);
    } finally {
      client.release();
    }
  }

  static async countByHighlight() {
    const client = await pool.connect();
    try {
      const query = `
      SELECT 
          CAST(COUNT(*) AS INTEGER) AS total_reviews 
      FROM 
          reviews 
      WHERE 
          is_highlight = TRUE;
      `;

      const result = await client.query(query);

      return result.rows[0].total_reviews;
    } catch (error) {
      throw ErrorHelper.catch("count reviews by highlight", error);
    } finally {
      client.release();
    }
  }
}
