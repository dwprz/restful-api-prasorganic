import pool from "../../../src/apps/postgresql.app";
import bcrypt from "bcrypt";
import { User } from "../../../src/interfaces/user.interface";

export class AdminTestModel {
  private static admin = {
    email: "adminTest123@gmail.com",
    full_name: "Admin Test123",
    password: "Password Test",
  };

  static async create() {
    const client = await pool.connect();
    try {
      const password = await bcrypt.hash(this.admin.password, 10);

      const query = `
        INSERT INTO 
            users (email, full_name, password, role, created_at, updated_at)
        VALUES 
            ('${this.admin.email}', '${this.admin.full_name}', '${password}', 'ADMIN', now(), now())
        RETURNING 
            user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
        `;

      const result = await client.query(query);
      const admin = result.rows[0] as User;

      return { ...admin, password: this.admin.password };
    } catch (error) {
      console.log("admin test model create: ", error);
    } finally {
      client.release();
    }
  }

  static async delete() {
    const client = await pool.connect();
    try {
      const query = `
      DELETE FROM 
          users 
      WHERE 
          (
            email = '${this.admin.email}'
            OR
            email = 'new${this.admin.email}'
          )
          AND
          role = 'ADMIN'; 
      `;

      await client.query(query);
    } catch (error) {
      console.log("admin test model delete: ", error);
    } finally {
      client.release();
    }
  }
}
