import pool from "../../../src/apps/postgresql.app";

export class OtpTestModel {
  private static pool = pool;

  static async upsertByEmail(email: string, otp: string) {
    const client = await this.pool.connect();
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
    } catch (error: any) {
      console.log("otp test model upsert by email: ", error.message);
    } finally {
      client.release();
    }
  }

  static async deleteByEmail(email: string) {
    const client = await this.pool.connect();
    try {
      const query = `
      DELETE FROM otp WHERE email = $1 RETURNING *;`;

      await client.query(query, [email]);
    } catch (error: any) {
      console.log("otp test model delete by email: ", error.message);
    } finally {
      client.release();
    }
  }
}
