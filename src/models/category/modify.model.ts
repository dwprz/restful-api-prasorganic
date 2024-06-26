import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { CategoryOnProductSubModel } from "../category-on-product/sub.model";
import { CategorySubModel } from "./sub.model";

export class CategoryModelModify {
  static async update(
    categories: string[],
    new_categories: string[],
    product_id: number
  ) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      const categories_to_be_deleted = categories.filter(
        (category) => !new_categories.includes(category)
      );

      const categories_to_be_added = new_categories.filter(
        (category) => !categories.includes(category)
      );

      if (categories_to_be_deleted.length) {
        await CategorySubModel.deleteByNames(
          client,
          categories_to_be_deleted,
          product_id
        );
      }

      const category_ids = await CategorySubModel.upsert(
        client,
        categories_to_be_added
      );

      const categories_on_product = category_ids.map(({ category_id }) => {
        return { category_id, product_id };
      });

      await CategoryOnProductSubModel.upsert(client, categories_on_product);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw ErrorHelper.catch("update categories", error);
    } finally {
      client.release();
    }
  }
}
