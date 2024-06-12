import pool from "../../src/apps/postgresql.app";

export class CartTestUtil {
  static async create(user_id: number, product_id: number) {
    const client = await pool.connect();

    try {
      const query = `
      INSERT INTO 
          carts(user_id, product_id, quantity, total_gross_price) 
      VALUES
          (${user_id}, ${product_id}, 10, 250000)
      ON CONFLICT
          (user_id, product_id)
      DO UPDATE SET
          user_id = EXCLUDED.user_id, product_id = EXCLUDED.product_id 
      RETURNING *;    
      `;

      const result = await client.query(query);
      const cart_item = result.rows[0];

      return cart_item;
    } catch (error: any) {
      console.log("error cart test util create: ", error.message);
    } finally {
      client.release();
    }
  }

  static async delete(user_id: number) {
    const client = await pool.connect();

    try {
      const query = `DELETE FROM carts WHERE user_id = ${user_id || 0}`;

      await client.query(query);
    } catch (error: any) {
      console.log("error cart test util delete: ", error.message);
    } finally {
      client.release();
    }
  }
}
