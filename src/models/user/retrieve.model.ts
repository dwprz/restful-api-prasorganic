import pool from "../../apps/postgresql.app";
import ErrorResponse from "../../errors/response.error";
import { User, UserSanitized } from "../../interfaces/user.interface";
import { UserHelper } from "../../helpers/user.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import { ErrorHelper } from "../../helpers/error.helper";
import { UserCache } from "../../cache/user.cache";

export class UserModelRetrieve {
  static async findAndSanitize(user_id: number) {
    const client = await pool.connect();
    try {
      const query = `
      SELECT * FROM users WHERE user_id = $1;
      `;

      const result = await client.query(query, [user_id]);
      const { password, refresh_token, ...user } = result.rows[0];

      await UserCache.cache(user);

      return user as UserSanitized;
    } catch (error) {
      throw ErrorHelper.catch("find and sanitize user", error);
    } finally {
      client.release();
    }
  }

  static async findByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    const field_values = SqlHelper.getFieldValues(fields);
    const where_clause = SqlHelper.buildWhereClause(fields);

    try {
      const query = `SELECT * FROM users WHERE ${where_clause};`;

      const result = await client.query(query, [...field_values]);
      const user = result.rows[0] as User;

      if (!user) {
        throw new ErrorResponse(404, "user not found");
      }

      return user;
    } catch (error) {
      throw ErrorHelper.catch(`find user by ${field_names}`, error);
    } finally {
      client.release();
    }
  }

  static async findManyByFields(
    fields: Record<string, any>,
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    const field_values = SqlHelper.getFieldValues(fields);
    const where_clause = SqlHelper.buildWhereClause(fields);

    try {
      const query = `
      SELECT * FROM users WHERE ${where_clause} LIMIT ${limit} OFFSET ${offset};
      `;

      const result = await client.query(query, [...field_values]);

      let users = result.rows as User[];
      users = UserHelper.sanitize(users);

      return users;
    } catch (error) {
      throw ErrorHelper.catch(`find users by ${field_names}`, error);
    } finally {
      client.release();
    }
  }
}
