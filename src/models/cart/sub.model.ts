import { PoolClient } from "pg";

export class CartSubModel {
  static async deleteByProductId(client: PoolClient, product_id: number) {
    const query = `DELETE FROM carts WHERE product_id = $1;`;

    await client.query(query, [product_id]);
  }
}
