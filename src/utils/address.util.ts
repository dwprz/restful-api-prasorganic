import pool from "../apps/database.app";
import ErrorResponse from "../error/response.error";
import { SqlHelper } from "../helpers/sql.helper";
import { AddressInput, AddressUpdate } from "../interfaces/address";

export class AddressUtil {
  static async create(data: AddressInput) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION");

      if (data.is_main_address) {
        const query = `
        UPDATE
            addresses 
        SET 
            is_main_address = CASE
            WHEN is_main_address = TRUE THEN FALSE
            ELSE is_main_address
            END
        WHERE 
            user_id = ${data.user_id};
        `;

        await client.query(query);
      }

      const field_names = SqlHelper.getFieldNames(data);
      const field_values = SqlHelper.getFieldValues(data);
      const parameterized_queries = SqlHelper.buildParameterizedQueries(data);

      const query = `
      INSERT INTO 
            addresses(${field_names}, created_at, updated_at)
      VALUES
            (${parameterized_queries}, now(), now())
      RETURNING *;
      `;

      const result = await client.query(query, field_values);
      const address = result.rows[0];

      await client.query("COMMIT TRANSACTION;");

      return address;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw new ErrorResponse(400, "failed to create address");
    } finally {
      client.release();
    }
  }

  static async findManyByUserId(user_id: number) {
    const client = await pool.connect();
    try {
      const query = `SELECT * FROM addresses WHERE user_id = ${user_id};`;

      const result = await client.query(query);
      const addresses = result.rows;

      return addresses;
    } catch (error) {
      throw new ErrorResponse(400, "failed to get addresses by user id");
    } finally {
      client.release();
    }
  }

  static async updateById(data: AddressUpdate) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      if (data.is_main_address) {
        const query = `
            UPDATE
                addresses 
            SET 
                is_main_address = CASE
                WHEN is_main_address = TRUE THEN FALSE
                ELSE is_main_address
                END
            WHERE 
                user_id = ${data.user_id};
            `;

        await client.query(query);
      }

      const set_clause = SqlHelper.buildSetClause(data);
      const field_values = SqlHelper.getFieldValues(data);

      const query = `
      UPDATE 
          addresses SET ${set_clause} 
      WHERE 
          address_id = ${data.address_id} 
      RETURNING *;
      `;

      const result = await client.query(query, field_values);
      const address = result.rows[0];

      await client.query("COMMIT TRANSACTION;");

      return address;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw new ErrorResponse(400, "failed to update address by id");
    } finally {
      client.release();
    }
  }

  static async deleteById(address_id: number) {
    const client = await pool.connect();
    try {
      const query = `DELETE FROM addresses WHERE address_id = ${address_id};`;

      await client.query(query);
    } catch (error) {
      throw new ErrorResponse(400, "failed to delete address by id");
    } finally {
      client.release();
    }
  }
}
