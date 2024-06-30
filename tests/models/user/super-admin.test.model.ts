import pool from "../../../src/apps/postgresql.app";
import bcrypt from "bcrypt";
import { User } from "../../../src/interfaces/user.interface";

export class SuperAdminTestModel {
  private static super_admin = {
    email: "superAdminTest123@gmail.com",
    full_name: "Super Admin Test123",
    password: "Password Test",
  };

  static async create() {
    const client = await pool.connect();
    try {
      const password = await bcrypt.hash(this.super_admin.password, 10);

      const query = `
        INSERT INTO 
            users (email, full_name, password, role, created_at, updated_at)
        VALUES 
            ('${this.super_admin.email}', '${this.super_admin.full_name}', '${password}', 'SUPER_ADMIN', now(), now())
        RETURNING 
            user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
        `;

      const result = await client.query(query);
      const super_admin = result.rows[0] as User;

      return { ...super_admin, password: this.super_admin.password };
    } catch (error) {
      console.log("super admin test model create: ", error);
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
            email = '${this.super_admin.email}'
            OR
            email = 'new${this.super_admin.email}'
          )
          AND
          role = 'SUPER_ADMIN'; 
      `;

      await client.query(query);
    } catch (error) {
      console.log("super admin test model delete: ", error);
    } finally {
      client.release();
    }
  }
}
