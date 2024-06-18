import pool from "../apps/postgresql.app";
import ErrorResponse from "../error/response.error";
import { ErrorHelper } from "../helpers/error.helper";
import { OTP } from "../interfaces/otp.interface";

export class AuthUtil {
  static async upsertOtpByEmail(email: string, otp: string) {
    const client = await pool.connect();
    try {
      const query = `
      INSERT INTO 
          otp (email, otp) VALUES ($1, $2)
      ON CONFLICT 
          (email)
      DO UPDATE SET 
          otp = $2
      RETURNING *;
      `;

      await client.query(query, [email, otp]);
    } catch (error) {
      throw ErrorHelper.catch("upsert otp by email", error);
    } finally {
      client.release();
    }
  }

  static async getOtpByEmail(email: string) {
    const client = await pool.connect();

    try {
      const query = `
      SELECT * FROM otp WHERE email = $1;
      `;

      const result = await client.query(query, [email]);

      if (result.rowCount === 0) {
        throw new ErrorResponse(404, "no otp match this email");
      }

      return result.rows[0] as OTP;
    } catch (error) {
      throw ErrorHelper.catch("get otp by email", error);
    } finally {
      client.release();
    }
  }

  static async deleteOtpByEmail(email: string) {
    const client = await pool.connect();
    try {
      const query = `
      DELETE FROM otp WHERE email = $1 RETURNING *;`;

      const result = await client.query(query, [email]);

      if (result.rowCount === 0) {
        throw new ErrorResponse(404, "no otp match this email");
      }
    } catch (error) {
      throw ErrorHelper.catch("delete otp by email", error);
    } finally {
      client.release();
    }
  }
}
