import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";

export class UserModelCount {
  static async countByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);

    try {
      const field_values = SqlHelper.getFieldValues(fields);
      const where_clause = SqlHelper.buildWhereClause(fields);

      const query = `SELECT CAST(COUNT(user_id) AS INTEGER) FROM users WHERE ${where_clause}`;

      const result = await client.query(query, field_values);
      const total_users = result.rows[0].count;

      return total_users;
    } catch (error) {
      throw ErrorHelper.catch(`count users by ${field_names}`, error);
    } finally {
      client.release();
    }
  }
}
