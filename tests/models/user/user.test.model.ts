import pool from "../../../src/apps/postgresql.app";
import bcrypt from "bcrypt";
import { User } from "../../../src/interfaces/user.interface";

export class UserTestModel {
  private static user = {
    email: "userTest123@gmail.com",
    full_name: "User Test123",
    password: "Password Test",
    whatsapp: "08123456789",
  };

  static async create() {
    const client = await pool.connect();
    try {
      const password = await bcrypt.hash(this.user.password, 10);

      const query = `
      INSERT INTO 
          users (email, full_name, whatsapp, password, role, created_at, updated_at)
      VALUES 
          ('${this.user.email}', '${this.user.full_name}', '${this.user.whatsapp}', '${password}', 'USER', now(), now())
      RETURNING 
          user_id, email, full_name, role, photo_profile, whatsapp, created_at, updated_at;
      `;

      const result = await client.query(query);
      const user = result.rows[0] as User;

      return { ...user, password: this.user.password };
    } catch (error: any) {
      console.log("user test model create: ", error);
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
          (email = '${this.user.email}'
          OR 
          email = 'new${this.user.email}')
          AND 
          role = 'USER';
      `;

      await client.query(query);
    } catch (error) {
      console.log("user test model delete: ", error);
    } finally {
      client.release();
    }
  }
}
