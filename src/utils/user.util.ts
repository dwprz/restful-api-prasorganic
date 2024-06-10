import pool from "../apps/database.app";
import ErrorResponse from "../error/response.error";
import { User, UserLoginWithGoogle, UserRegister } from "../interfaces/user";
import { UserHelper } from "../helpers/user.helper";
import { SqlHelper } from "../helpers/sql.helper";

export class UserUtil {
  static async create({ email, full_name, password }: UserRegister) {
    const client = await pool.connect();

    try {
      const query = `
      INSERT INTO 
          users (email, full_name, password, role, created_at, updated_at)
      VALUES 
          ($1, $2, $3, 'USER', now(), now())
      RETURNING 
          user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
      `;

      const result = await client.query(query, [email, full_name, password]);
      const user = result.rows[0] as User;

      return user;
    } catch (error) {
      throw new ErrorResponse(400, "failed to create user");
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

      return user;
    } catch (error) {
      throw new ErrorResponse(400, `failed to find user by: ${field_names}`);
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
      users = UserHelper.transform(users);

      return users;
    } catch (error) {
      throw new ErrorResponse(400, `failed to find users by: ${field_names}`);
    } finally {
      client.release();
    }
  }

  static async countByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    const field_values = SqlHelper.getFieldValues(fields);
    const where_clause = SqlHelper.buildWhereClause(fields);

    try {
      const query = `SELECT CAST(COUNT(user_id) AS INTEGER) FROM users WHERE ${where_clause}`;

      const result = await client.query(query, field_values);
      const total_users = result.rows[0].count;

      return total_users;
    } catch (error) {
      throw new ErrorResponse(400, `failed to get count by: ${field_names}`);
    } finally {
      client.release();
    }
  }

  static async updateByEmail(fields: Record<string, any>, email: string) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    const field_values = SqlHelper.getFieldValues(fields);
    const set_clause = SqlHelper.buildSetClause(fields);

    try {
      const query = `
      UPDATE 
          users 
      SET 
          ${set_clause}
      WHERE 
          email = $${field_values.length + 1}
      RETURNING 
          user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
      `;

      const result = await client.query(query, [...field_values, email]);

      const { password, refresh_token, ...user } = result.rows[0] as User;
      return user;
    } catch (error) {
      throw new ErrorResponse(400, `failed to update user: ${field_names}.`);
    } finally {
      client.release();
    }
  }

  static async upsertByEmail(data: UserLoginWithGoogle) {
    const client = await pool.connect();

    try {
      const query = `
      INSERT INTO 
          users (email, full_name, photo_profile, role, created_at, updated_at)
      VALUES
          ($1, $2, $3, 'USER', now(), now())
      ON CONFLICT
          (email)
      DO UPDATE SET
          full_name = $2, updated_at = now()
      RETURNING
          user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
      `;

      const result = await client.query(query, [
        data.email,
        data.full_name,
        data.photo_profile,
      ]);

      const { password, refresh_token, ...user } = result.rows[0] as User;
      return user;
    } catch (error) {
      throw new ErrorResponse(400, "failed to upsert user by email");
    } finally {
      client.release();
    }
  }
}