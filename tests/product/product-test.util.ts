import pool from "../../src/apps/postgresql.app";
import { SqlHelper } from "../../src/helpers/sql.helper";
import { Product } from "../../src/interfaces/product.interface";

export class ProductTestUtil {
  private static product = {
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

  private static categories = ["category1", "category2", "category3"];

  static async createWithCategories() {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      // create product
      let parameterized_queries = SqlHelper.buildParameterizedQueries(
        this.product
      );

      let field_names = SqlHelper.getFieldNames(this.product);
      let field_values = SqlHelper.getFieldValues(this.product);

      let query = `
      INSERT INTO 
          products(${field_names}, created_at, updated_at)
      VALUES
          (${parameterized_queries}, now(), now())
      RETURNING *;    
      `;

      let result = await client.query(query, [...field_values]);
      const product_result = result.rows[0] as Product;

      // create categories
      let values_placeholders = SqlHelper.buildValuesPlaceholders(
        this.categories
      );

      query = `
      INSERT INTO 
            categories(category_name) VALUES ${values_placeholders}
      ON CONFLICT
            (category_name) 
      DO UPDATE SET
            category_name = EXCLUDED.category_name 
      RETURNING 
            category_id;`;

      result = await client.query(query, this.categories);
      let category_ids = result.rows;

      // create categories on products
      category_ids = category_ids.map(({ category_id }) => {
        return { category_id, product_id: product_result.product_id };
      });

      values_placeholders = SqlHelper.buildValuesPlaceholders(category_ids);
      field_values = SqlHelper.getFieldValues(category_ids);

      query = `
      INSERT INTO 
            categories_on_products (category_id, product_id) 
      VALUES 
          ${values_placeholders};
      `;

      await client.query(query, field_values);

      await client.query("COMMIT TRANSACTION;");

      return { ...product_result, categories: this.categories };
    } catch (error: any) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("failed to create product with categories: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createManyWithCategories() {
    const client = await pool.connect();

    let products_request: any[] = [];

    for (let index = 0; index < 20; index++) {
      const product = {
        ...this.product,
        product_name: `${this.product.product_name} ${index + 1}`,
      };

      products_request.push(product);
    }

    let products_result: any[] = [];

    try {
      await client.query("BEGIN TRANSACTION;");

      for (const product of products_request) {
        // create product
        let parameterized_queries =
          SqlHelper.buildParameterizedQueries(product);

        let field_names = SqlHelper.getFieldNames(product);
        let field_values = SqlHelper.getFieldValues(product);

        let query = `
        INSERT INTO 
            products(${field_names}, created_at, updated_at)
        VALUES
            (${parameterized_queries}, now(), now())
        RETURNING *;    
        `;

        let result = await client.query(query, [...field_values]);
        const product_result = result.rows[0] as Product;

        // create categories
        let values_placeholders = SqlHelper.buildValuesPlaceholders(
          this.categories
        );

        query = `
        INSERT INTO 
              categories(category_name) VALUES ${values_placeholders}
        ON CONFLICT
              (category_name) 
        DO UPDATE SET
              category_name = EXCLUDED.category_name 
        RETURNING 
              category_id;`;

        result = await client.query(query, this.categories);
        let category_ids = result.rows;

        // create categories on products
        category_ids = category_ids.map(({ category_id }) => {
          return { category_id, product_id: product_result.product_id };
        });

        values_placeholders = SqlHelper.buildValuesPlaceholders(category_ids);
        field_values = SqlHelper.getFieldValues(category_ids);

        query = `
        INSERT INTO 
              categories_on_products (category_id, product_id) 
        VALUES 
            ${values_placeholders};
        `;

        await client.query(query, field_values);

        products_result.push({
          ...product_result,
          categories: this.categories,
        });
      }

      await client.query("COMMIT TRANSACTION;");

      return products_result;
    } catch (error: any) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("failed to create products with categories: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createManyTopProducts() {
    const client = await pool.connect();

    let products_request: any[] = [];

    for (let index = 0; index < 8; index++) {
      const product = {
        ...this.product,
        product_name: `${this.product.product_name} ${index + 1}`,
        is_top_product: true,
      };

      products_request.push(product);
    }

    let products_result: any[] = [];

    try {
      await client.query("BEGIN TRANSACTION;");

      for (const product of products_request) {
        // create product
        let parameterized_queries =
          SqlHelper.buildParameterizedQueries(product);

        let field_names = SqlHelper.getFieldNames(product);
        let field_values = SqlHelper.getFieldValues(product);

        let query = `
        INSERT INTO 
            products(${field_names}, created_at, updated_at)
        VALUES
            (${parameterized_queries}, now(), now())
        RETURNING *;    
        `;

        let result = await client.query(query, [...field_values]);
        const product_result = result.rows[0] as Product;

        products_result.push(product_result);
      }

      await client.query("COMMIT TRANSACTION;");

      return products_result;
    } catch (error: any) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("failed to create top products: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createDeleted() {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      let parameterized_queries = SqlHelper.buildParameterizedQueries(
        this.product
      );

      let field_names = SqlHelper.getFieldNames(this.product);
      let field_values = SqlHelper.getFieldValues(this.product);

      let query = `
      INSERT INTO 
          products(${field_names}, created_at, updated_at)
      VALUES
          (${parameterized_queries}, now(), now())
      RETURNING *;    
      `;

      let result = await client.query(query, field_values);
      let product = result.rows[0];

      query = `DELETE FROM products WHERE product_id = ${product.product_id};`;

      result = await client.query(query);

      field_names = SqlHelper.getFieldNames(product);
      field_values = SqlHelper.getFieldValues(product);
      parameterized_queries = SqlHelper.buildParameterizedQueries(product);

      query = `INSERT INTO deleted_products(${field_names}) VALUES(${parameterized_queries}) RETURNING *;`;

      result = await client.query(query, field_values);
      product = result.rows[0];

      await client.query("COMMIT TRANSACTION");

      return product;
    } catch (error: any) {
      await client.query("ROLLBACK TRANSACTION");
      console.log("failed to create deleted product: ", error.message);
    } finally {
      client.release();
    }
  }

  static async createManyDeleted() {
    const client = await pool.connect();

    let products_request: any[] = [];

    for (let index = 0; index < 20; index++) {
      const product = {
        ...this.product,
        product_name: `${this.product.product_name} ${index + 1}`,
      };

      products_request.push(product);
    }

    let products_result: any[] = [];

    try {
      await client.query("BEGIN TRANSACTION;");

      for (const product of products_request) {
        let parameterized_queries =
          SqlHelper.buildParameterizedQueries(product);

        let field_names = SqlHelper.getFieldNames(product);
        let field_values = SqlHelper.getFieldValues(product);

        let query = `
        INSERT INTO 
            products(${field_names}, created_at, updated_at)
        VALUES
            (${parameterized_queries}, now(), now())
        RETURNING *;    
        `;

        let result = await client.query(query, field_values);
        let product_result = result.rows[0];

        query = `DELETE FROM products WHERE product_id = ${product_result.product_id};`;

        result = await client.query(query);

        field_names = SqlHelper.getFieldNames(product_result);
        field_values = SqlHelper.getFieldValues(product_result);

        parameterized_queries =
          SqlHelper.buildParameterizedQueries(product_result);

        query = `
        INSERT INTO 
            deleted_products(${field_names}) 
        VALUES
            (${parameterized_queries}) 
        RETURNING *;
        `;

        result = await client.query(query, field_values);
        product_result = result.rows[0];

        products_result.push(product_result);
      }

      await client.query("COMMIT TRANSACTION;");

      return products_result;
    } catch (error: any) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("failed to create deleted products: ", error.message);
    } finally {
      client.release();
    }
  }

  static async deleteWithCategories(product_id: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      let query = `
      DELETE FROM  
          categories_on_products 
      WHERE 
          product_id = ${product_id || 0} 
      RETURNING 
          category_id;
      `;

      let result = await client.query(query);

      const category_ids = result.rows.length
        ? result.rows.map(({ category_id }) => category_id || 0).join(", ")
        : "0";

      query = `DELETE FROM products WHERE product_id = ${product_id || 0};`;

      await client.query(query);

      query = `DELETE FROM categories_on_deleted_products WHERE product_id = ${
        product_id || 0
      };`;

      await client.query(query);

      query = `DELETE FROM deleted_products WHERE product_id = ${
        product_id || 0
      };`;

      await client.query(query);

      query = `DELETE FROM categories WHERE category_id IN (${category_ids});`;

      await client.query(query);

      query = `
      DELETE FROM categories WHERE category_name IN (${this.categories
        .map((category) => `'${category}'`)
        .join(", ")});
      `;

      await client.query(query);

      await client.query("COMMIT TRANSACTION;");
    } catch (error: any) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("failed to delete product with categories: ", error.message);
    } finally {
      client.release();
    }
  }

  static async deleteManyWithCategories(product_ids: number[]) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      if (!product_ids.length) {
        product_ids = [0];
      }

      let query = `
      DELETE FROM 
          categories_on_products 
      WHERE 
          product_id IN (${product_ids.join(", ")}) 
      RETURNING 
          category_id;
      `;

      let result = await client.query(query);
      const category_ids = result.rows.length
        ? result.rows.map(({ category_id }) => category_id || 0).join(", ")
        : "0";

      query = `
      DELETE FROM 
          products 
      WHERE 
          product_id IN (${product_ids.join(", ")});
      `;

      await client.query(query);

      query = `
      DELETE FROM
          categories_on_deleted_products
      WHERE
          product_id IN (${product_ids.join(", ")});
      `;

      await client.query(query);

      query = `
      DELETE FROM
          deleted_products
      WHERE
          product_id IN (${product_ids.join(", ")});
      `;

      await client.query(query);

      query = `DELETE FROM categories WHERE category_id IN (${category_ids});`;

      await client.query(query);

      query = `
      DELETE FROM categories WHERE category_name IN (${this.categories
        .map((category) => `'${category}'`)
        .join(", ")});
      `;

      await client.query(query);

      await client.query("COMMIT TRANSACTION;");
    } catch (error: any) {
      await client.query("ROLLBACK TRANSACTION;");
      console.log("failed to create products with categories: ", error.message);
    } finally {
      client.release();
    }
  }
}
