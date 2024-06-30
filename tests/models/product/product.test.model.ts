import pool from "../../../src/apps/postgresql.app";
import { CategoryOnProductTestSubModel } from "../category-on-product/sub.test.model";
import { CategoryTestModel } from "../category/category.test.model";
import { CategoryTestSubModel } from "../category/sub.test.model";
import { ProductTestSubModel } from "./sub.test.model";

export class ProductTestModel {
  static product = {
    product_name: "PRODUCT TEST",
    image: "IMAGE TEST",
    price: 20000,
    stock: 250,
    length: 30,
    width: 15,
    height: 15,
    weight: 5,
    description: "DESCRIPTION TEST",
  };

  static async create() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      const product = await ProductTestSubModel.insert(client, this.product);

      const categories = CategoryTestModel.categories;
      const category_ids = await CategoryTestSubModel.insert(
        client,
        categories
      );

      const categories_on_product = category_ids.map(({ category_id }) => {
        return { category_id, product_id: product.product_id };
      });

      await CategoryOnProductTestSubModel.insert(client, categories_on_product);

      await client.query("COMMIT TRANSACTION;");

      return { ...product, categories };
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("product test model create: ", error);
    } finally {
      client.release();
    }
  }

  static async delete(product_id: number) {
    const client = await pool.connect();
    try {
      const category_ids = await CategoryOnProductTestSubModel.delete(
        client,
        product_id
      );

      for (const { category_id } of category_ids) {
        await CategoryTestSubModel.delete(client, category_id);
      }

      await ProductTestSubModel.delete(client, product_id);
    } catch (error) {
      console.log("product test model delete: ", error);
    } finally {
      client.release();
    }
  }
}
