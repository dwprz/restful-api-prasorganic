import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";

export class AddressModelRetrieve {
  static async findManyByUserId(user_id: number) {
    const client = await pool.connect();
    try {
      const query = `SELECT * FROM addresses WHERE user_id = ${user_id};`;

      const result = await client.query(query);
      const addresses = result.rows;

      return addresses;
    } catch (error) {
      throw ErrorHelper.catch("find addresses by user id", error);
    } finally {
      client.release();
    }
  }
}
