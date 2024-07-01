import pool from "../../../src/apps/postgresql.app";
import { CategoryOnProductTestSubModel } from "../category-on-product/sub.test.model";
import { CategoryTestModel } from "../category/category.test.model";
import { CategoryTestSubModel } from "../category/sub.test.model";
import { ProductTestSubModel } from "./sub.test.model";

export class ProductTestModel {
  static createInstance() {
    return {
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
  }

  static createManyInstance() {
    let products: any[] = [];

    for (let index = 0; index < 20; index++) {
      const product = {
        ...this.createInstance(),
        product_name: `${this.createInstance().product_name} ${index + 1}`,
      };

      products.push(product);
    }

    return products;
  }

  static async create() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      // create product
      const product = await ProductTestSubModel.insert(
        client,
        this.createInstance()
      );

      // create categories
      const categories = CategoryTestModel.createInstance();
      const category_ids = await CategoryTestSubModel.upsert(
        client,
        categories
      );

      // create categories on products
      const categories_on_product = category_ids.map((category_id) => {
        return { category_id, product_id: product.product_id };
      });

      await CategoryOnProductTestSubModel.insert(client, categories_on_product);

      await client.query("COMMIT TRANSACTION;");

      return { ...product, categories };
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log(`product test model create: `, error.message);
    } finally {
      client.release();
    }
  }

  static async createTopProduct() {
    const client = await pool.connect();

    try {
      const product = await ProductTestSubModel.insert(client, {
        ...this.createInstance(),
        is_top_product: true,
      });

      return product;
    } catch (error) {
      console.log("product test model create: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createMany() {
    const client = await pool.connect();

    let products_request = this.createManyInstance();

    let products: any[] = [];

    try {
      await client.query("BEGIN TRANSACTION;");

      for (const product of products_request) {
        // create product
        const product_result = await ProductTestSubModel.insert(
          client,
          product
        );

        // create categories
        const categories = CategoryTestModel.createInstance();
        const category_ids = await CategoryTestSubModel.upsert(
          client,
          categories
        );

        // create categories on products
        const categories_on_product = category_ids.map((category_id) => {
          return { category_id, product_id: product_result.product_id };
        });

        await CategoryOnProductTestSubModel.insert(
          client,
          categories_on_product
        );

        products.push({ ...product_result, categories });
      }

      await client.query("COMMIT TRANSACTION;");

      return products;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log(`product test model create many: `, error.message);
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
      console.log(`product test model delete: `, error.message);
    } finally {
      client.release();
    }
  }

  static async deleteMany(product_ids: number[]) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      if (product_ids.length === 0) {
        product_ids = [0];
      }

      const category_ids = await CategoryOnProductTestSubModel.deleteMany(
        client,
        product_ids
      );

      if (!category_ids) return;

      await CategoryTestSubModel.deleteMany(client, category_ids);

      await ProductTestSubModel.deleteMany(client, product_ids);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("product test model delete many: ", error.message);
    } finally {
      client.release();
    }
  }
}
