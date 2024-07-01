import { PoolClient } from "pg";
import pool from "../../../src/apps/postgresql.app";
import { ProductTestModel } from "../product/product.test.model";
import { ProductTestSubModel } from "../product/sub.test.model";
import { DeletedProductTestSubModel } from "./sub..test.model";
import { CategoryOnDeletedProductTestSubModel } from "../category-on-deleted-product.model.ts/sub.test.model";
import { CategoryTestSubModel } from "../category/sub.test.model";

export class DeletedProductTestModel {
  static async create() {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      let product = ProductTestModel.createInstance() as any;

      product = await ProductTestSubModel.insert(client, product);

      await ProductTestSubModel.delete(client, product.product_id);

      product = await DeletedProductTestSubModel.insert(client, product);

      await client.query("COMMIT TRANSACTION");

      return product;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION");
      console.log("deleted product test model create: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createMany() {
    const client = await pool.connect();

    let products_request = ProductTestModel.createManyInstance();

    let products_result: any[] = [];

    try {
      await client.query("BEGIN TRANSACTION;");

      for (const product of products_request) {
        let product_result = await ProductTestSubModel.insert(client, product);

        await ProductTestSubModel.delete(client, product_result.product_id);

        await DeletedProductTestSubModel.insert(client, product_result);

        products_result.push(product_result);
      }

      await client.query("COMMIT TRANSACTION;");

      return products_result;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("deleted product test model create many: ", error.message);
    } finally {
      client.release();
    }
  }

  static async delete(product_id: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      const category_ids = await CategoryOnDeletedProductTestSubModel.delete(
        client,
        product_id
      );

      await CategoryTestSubModel.deleteMany(client, category_ids);

      await DeletedProductTestSubModel.delete(client, product_id);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("deleted product test model delete: ", error.message);
    } finally {
      client.release();
    }
  }

  static async deleteMany(product_ids: number[]) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      const category_ids =
        await CategoryOnDeletedProductTestSubModel.deleteMany(
          client,
          product_ids
        );

      if (!category_ids) return;

      await CategoryTestSubModel.deleteMany(client, category_ids);

      await DeletedProductTestSubModel.deleteMany(client, product_ids);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("deleted product test model delete: ", error.message);
    } finally {
      client.release();
    }
  }
}
