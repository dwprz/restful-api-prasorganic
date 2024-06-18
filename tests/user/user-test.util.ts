import pool from "../../src/apps/postgresql.app";
import bcrypt from "bcrypt";
import { User } from "../../src/interfaces/user.interface";

export class UserTestUtil {
  private static user = {
    email: "userTest123@gmail.com",
    full_name: "User Test123",
    password: "Password Test",
    whatsapp: "08123456789",
  };

  private static admin = {
    email: "adminTest123@gmail.com",
    full_name: "Admin Test123",
    password: "Password Test",
  };

  private static super_admin = {
    email: "superAdminTest123@gmail.com",
    full_name: "Super Admin Test123",
    password: "Password Test",
  };

  static async createUser() {
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

      if (!user) {
        return console.log("user test util: failed to create user");
      }

      return { ...user, password: this.user.password };
    } catch (error: any) {
      console.log("error from user test utils: ", error.message);
    } finally {
      client.release();
    }
  }

  static async deleteUser() {
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
    } catch (error: any) {
      console.log("error from user test utils: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createAdmin() {
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
    } catch (error: any) {
      console.log("error from user test utils: ", error.message);
    } finally {
      client.release();
    }
  }

  static async deleteAdmin() {
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
    } catch (error: any) {
      console.log("error from user test utils: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createSuperAdmin() {
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
    } catch (error: any) {
      console.log("error from user test utils: ", error.message);
    } finally {
      client.release();
    }
  }

  static async deleteSuperAdmin() {
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
    } catch (error: any) {
      console.log("error from user test utils: ", error.message);
    } finally {
      client.release();
    }
  }
}
