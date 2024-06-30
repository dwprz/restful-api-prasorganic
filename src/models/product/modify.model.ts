import { DatabaseError } from "pg";
import pool from "../../apps/postgresql.app";
import ErrorResponse from "../../errors/response.error";
import { ErrorHelper } from "../../helpers/error.helper";
import { SqlHelper } from "../../helpers/sql.helper";
import { ProductOrder } from "../../interfaces/order.interface";
import { ProductWithCategoriesInput } from "../../interfaces/product.interface";
import { CartSubModel } from "../cart/sub.model";
import { CategoryOnDeletedProductSubModel } from "../category-on-deleted-product/sub.model";
import { CategoryOnProductSubModel } from "../category-on-product/sub.model";
import { CategorySubModel } from "../category/sub.model";
import { DeletedProductSubModel } from "../deleted-product/sub.model";
import { ProductSubModel } from "./sub.model";

export class ProductModelModify {
  static async create(data: ProductWithCategoriesInput) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      // create product
      let { categories, ...product_request } = data;

      const product_result = await ProductSubModel.insert(
        client,
        product_request
      );

      // create categories
      if (!Array.isArray(categories)) {
        categories = [categories];
      }

      let category_ids = await CategorySubModel.upsert(client, categories);

      // create categories on product
      const categories_on_product = category_ids.map(({ category_id }) => {
        return { category_id, product_id: product_result.product_id };
      });

      await CategoryOnProductSubModel.upsert(client, categories_on_product);

      await client.query("COMMIT TRANSACTION;");

      return { ...product_result, categories };
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("create product with categories", error);
    } finally {
      client.release();
    }
  }

  static async restore(product_id: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      // delete product
      const deleted_product = await DeletedProductSubModel.deleteById(
        client,
        product_id
      );

      if (!deleted_product) {
        throw new ErrorResponse(404, "product not found");
      }

      // delete categories on deleted product
      const categories_on_product =
        await CategoryOnDeletedProductSubModel.deleteById(client, product_id);

      // create product
      const product = await ProductSubModel.upsert(client, deleted_product);

      if (!categories_on_product.length) {
        return product;
      }

      // create categories on product
      await CategoryOnProductSubModel.upsert(client, categories_on_product);

      await client.query("COMMIT TRANSACTION;");

      return product;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("restore product", error);
    } finally {
      client.release();
    }
  }

  static async updateById(fields: Record<string, any>, product_id: number) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      if (fields.stock) {
        const query = `SELECT stock FROM products WHERE product_id = $1 FOR UPDATE;`;

        await client.query(query, [product_id]);
      }

      const set_clause = SqlHelper.buildSetClause(fields);
      const field_values = SqlHelper.getFieldValues(fields);

      const query = `
      UPDATE 
          products 
      SET 
          ${set_clause} 
      WHERE 
          product_id = $${field_values.length + 1} 
      RETURNING *;
      `;

      const result = await client.query(query, [...field_values, product_id]);
      const product = result.rows[0];

      await client.query("COMMIT TRANSACTION;");

      return product;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");

      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ErrorResponse(409, "product name already exists");
      }

      throw ErrorHelper.catch("update product by id", error);
    } finally {
      client.release();
    }
  }

  static async rollbackStocks(products_order: ProductOrder[]) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      const locking_query = `SELECT stock FROM products WHERE product_id = $1 FOR UPDATE;`;
      const update_query = `UPDATE products SET stock = stock + $1 WHERE product_id = $2;`;

      for (const { quantity, product_id } of products_order) {
        await client.query(locking_query, [product_id]);

        await client.query(update_query, [quantity, product_id]);
      }

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("rollback stocks by ids", error);
    } finally {
      client.release();
    }
  }

  static async delete(product_id: number) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      // delete categories on product
      const categories_on_product = await CategoryOnProductSubModel.deleteById(
        client,
        product_id
      );

      // delete cart
      await CartSubModel.deleteByProductId(client, product_id);

      // delete product
      const product = await ProductSubModel.deleteById(client, product_id);

      // create deleted_product
      if (product.is_top_product) {
        product.is_top_product = false;
      }

      await DeletedProductSubModel.insert(client, product);

      // create categories_on_deleted_products
      await CategoryOnDeletedProductSubModel.upsert(
        client,
        categories_on_product
      );

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("delete product by id", error);
    } finally {
      client.release();
    }
  }
}
