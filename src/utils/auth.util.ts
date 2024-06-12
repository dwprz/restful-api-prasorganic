import pool from "../apps/postgresql.app";
import ErrorResponse from "../error/response.error";
import { OTP } from "../interfaces/otp";

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
      throw new ErrorResponse(400, "failed to upsert otp by email");
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

      const otp = (await client.query(query, [email])).rows[0] as OTP;

      if (!otp) {
        throw new ErrorResponse(404, "no otp matches the email");
      }

      return otp;
    } catch (error: any) {
      throw new ErrorResponse(error.status, error.message);
    } finally {
      client.release();
    }
  }

  static async deleteOtpByEmail(email: string) {
    const client = await pool.connect();
    try {
      const query = `
      DELETE FROM otp WHERE email = $1 RETURNING *;`;

      await client.query(query, [email]);
    } catch (error) {
      throw new ErrorResponse(400, "failed to delete otp");
    } finally {
      client.release();
    }
  }
}
