import pool from "../../src/apps/postgresql.app";
import { SqlHelper } from "../../src/helpers/sql.helper";

export class AddressTestUtil {
  private static address = {
    address_owner: "NAME TEST",
    street: "STREET TEST",
    subdistrict_id: "1",
    subdistrict: "SUBDISTRICT TEST",
    city_id: "1",
    city: "CITY TEST",
    province_id: "1",
    province: "PROVINCE TEST",
    whatsapp: "08123456789",
    is_main_address: true,
  };

  static async create(user_id: number) {
    const client = await pool.connect();
    try {
      const field_names = SqlHelper.getFieldNames({ ...this.address, user_id });

      const parameterized_queries = SqlHelper.buildParameterizedQueries({
        ...this.address,
        user_id,
      });

      const field_values = SqlHelper.getFieldValues({
        ...this.address,
        user_id,
      });

      const query = `
      INSERT INTO 
          addresses(${field_names}, created_at, updated_at) 
      VALUES
          (${parameterized_queries}, now(), now())
      RETURNING *;
      `;

      const result = await client.query(query, field_values);
      const address = result.rows[0];

      return address;
    } catch (error: any) {
      console.log("error address util test create: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createMany(user_id: number) {
    let addresses_request: any = [];

    for (let index = 0; index < 5; index++) {
      const address = {
        user_id: user_id,
        address_owner: this.address.address_owner,
        street: this.address.street + ` ${index + 1}`,
        subdistrict_id: (index + 1).toString(),
        subdistrict: this.address.subdistrict + ` ${index + 1}`,
        city_id: (index + 1).toString(),
        city: this.address.city + ` ${index + 1}`,
        province_id: (index + 1).toString(),
        province: this.address.province + ` ${index + 1}`,
        whatsapp: this.address.whatsapp + ` ${index + 1}`,
        is_main_address: false,
      };

      addresses_request.push(address);
    }

    const client = await pool.connect();

    let addresses_result: any = [];

    try {
      for (const address of addresses_request) {
        const field_names = SqlHelper.getFieldNames(address);

        const parameterized_queries =
          SqlHelper.buildParameterizedQueries(address);

        const field_values = SqlHelper.getFieldValues(address);

        const query = `
        INSERT INTO 
            addresses(${field_names}, created_at, updated_at) 
        VALUES
            (${parameterized_queries}, now(), now())
        RETURNING *;
        `;

        const result = await client.query(query, field_values);
        const address_result = result.rows[0];

        addresses_result.push(address_result);
      }

      return addresses_result;
    } catch (error: any) {
      console.log("error address util test create many: ", error.message);
    } finally {
      client.release();
    }
  }

  static async delete(user_id: number) {
    const client = await pool.connect();
    try {
      const query = `DELETE FROM addresses WHERE user_id = ${user_id};`;

      await client.query(query);
    } catch (error: any) {
      console.log("error address util test delete: ", error.message);
    } finally {
      client.release();
    }
  }
}
