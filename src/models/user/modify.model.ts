import { DatabaseError } from "pg";
import pool from "../../apps/postgresql.app";
import {
  User,
  UserLoginWithGoogle,
  UserRegister,
  UserSanitized,
} from "../../interfaces/user.interface";
import ErrorResponse from "../../errors/response.error";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import { UserCache } from "../../cache/user.cache";

export class UserModelModify {
  static async create({ email, full_name, password }: UserRegister) {
    const client = await pool.connect();

    try {
      const query = `
      INSERT INTO 
           users (email, full_name, password, role, created_at)
      VALUES 
           ($1, $2, $3, 'USER', now())
      RETURNING 
           user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
      `;

      const result = await client.query(query, [email, full_name, password]);
      const user = result.rows[0] as User;

      return user;
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ErrorResponse(409, "user already exists");
      }

      throw ErrorHelper.catch("create user", error);
    } finally {
      client.release();
    }
  }

  static async updateByEmail(fields: Record<string, any>, email: string) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      const field_values = SqlHelper.getFieldValues(fields);
      const set_clause = SqlHelper.buildSetClause(fields);

      const query = `
      UPDATE 
          users 
      SET 
          ${set_clause}, updated_at = now()
      WHERE 
          email = $${field_values.length + 1}
      RETURNING 
          user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
      `;

      const result = await client.query(query, [...field_values, email]);
      await UserCache.cache(result.rows[0]);

      await client.query("COMMIT TRANSACTION;");

      return result.rows[0] as UserSanitized;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");

      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ErrorResponse(409, "email already exists");
      }

      throw ErrorHelper.catch("update user by email", error);
    } finally {
      client.release();
    }
  }

  static async upsertByEmail(data: UserLoginWithGoogle) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      const query = `
      INSERT INTO 
          users (email, full_name, photo_profile, role, created_at)
      VALUES
          ($1, $2, $3, 'USER', now())
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

      await UserCache.cache(result.rows[0]);
      
      await client.query("COMMIT TRANSACTION;");

      return result.rows[0] as UserSanitized;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("upsert user by email", error);
    } finally {
      client.release();
    }
  }
}
