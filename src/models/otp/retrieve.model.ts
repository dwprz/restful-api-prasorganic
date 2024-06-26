import pool from "../../apps/postgresql.app";
import ErrorResponse from "../../errors/response.error";
import { ErrorHelper } from "../../helpers/error.helper";
import { OTP } from "../../interfaces/otp.interface";

export class OtpModelRetrieve {
  static async findByEmail(email: string) {
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
}
