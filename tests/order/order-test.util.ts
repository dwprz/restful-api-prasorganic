import pool from "../../src/apps/postgresql.app";

export class OrderTestUtil {
  static async deleteWithProductsOrder(order_id: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      let query = `
        DELETE FROM products_orders WHERE order_id = '${order_id}'; 
        `;

      await client.query(query);

      query = `
      DELETE FROM orders WHERE order_id = '${order_id}';
      `;

      await client.query(query);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("this order util error:", error);
    } finally {
      client.release();
    }
  }
}

// import prismaClient from "../../src/apps/database.app";

// const remove = async () => {
//   await prismaClient.productOrderHistori.deleteMany({});
//   await prismaClient.order.deleteMany({});
// };

// export const orderUtil = {
//   remove,
// };
