import pool from "../../../src/apps/postgresql.app";
import { SqlHelper } from "../../../src/helpers/sql.helper";

export class AddressTestModel {
  static createInstance() {
    return {
      address_owner: "NAME TEST",
      street: "STREET TEST",
      area_id: 14223,
      area: "Ngagel",
      lat: "-6.4912716",
      lng: "111.0370989",
      suburb_id: 1415,
      suburb: "Dukuhseti",
      city_id: 85,
      city: "Pati",
      province_id: 10,
      province: "Jawa Tengah",
      whatsapp: "08123456789",
      is_main_address: true,
    };
  }

  static async create(user_id: number) {
    const client = await pool.connect();
    try {
      const field_names = SqlHelper.getFieldNames({
        ...this.createInstance(),
        user_id,
      });

      const parameterized_queries = SqlHelper.buildParameterizedQueries({
        ...this.createInstance(),
        user_id,
      });

      const field_values = SqlHelper.getFieldValues({
        ...this.createInstance(),
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
      console.log("address test model create: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createMany(user_id: number) {
    let addresses_request: any = [];

    for (let index = 0; index < 5; index++) {
      const address = {
        user_id: user_id,
        ...this.createInstance(),
        address_owner: "NAME TEST" + ` ${index}`,
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
      console.log("address test model create many: ", error.message);
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
      console.log("address model test delete: ", error.message);
    } finally {
      client.release();
    }
  }
}
