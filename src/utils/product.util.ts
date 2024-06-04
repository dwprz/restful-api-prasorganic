import { Product, ProductInput } from "../interfaces/product";
import ErrorResponse from "../error/response.error";
import { SqlHelper } from "../helpers/sql.helper";
import pool from "../apps/database.app";
import { ProductHelper } from "../helpers/product.helper";
import { sql } from "googleapis/build/src/apis/sql";

export class ProductUtil {
  static async createWithCategories(data: ProductInput) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      // create product
      let { categories, ...product_request } = data;

      let parameterized_queries =
        SqlHelper.buildParameterizedQueries(product_request);

      let field_names = SqlHelper.getFieldNames(product_request);
      let field_values = SqlHelper.getFieldValues(product_request);

      let query = `
      INSERT INTO 
          products(${field_names}, created_at, updated_at)
      VALUES
          (${parameterized_queries}, now(), now())
      RETURNING *;    
      `;

      let result = await client.query(query, field_values);
      const product_res = result.rows[0] as Product;

      // create categories
      if (!Array.isArray(categories)) {
        categories = [categories];
      }

      let values_placeholders = SqlHelper.buildValuesPlaceholders(categories);

      query = `
      INSERT INTO 
            categories(category_name) VALUES ${values_placeholders}
      ON CONFLICT
            (category_name) 
      DO UPDATE SET
            category_name = EXCLUDED.category_name 
      RETURNING 
            category_id;`;

      result = await client.query(query, categories);
      let category_ids = result.rows;

      // create categories on products
      category_ids = category_ids.map(({ category_id }) => {
        return { category_id, product_id: product_res.product_id };
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

      return { ...product_res, categories };
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw new ErrorResponse(400, "failed to create product with categories");
    } finally {
      client.release();
    }
  }

  static async findByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    const field_values = SqlHelper.getFieldValues(fields);
    const where_clause = SqlHelper.buildWhereClause(fields);

    try {
      const query = `SELECT * FROM products WHERE ${where_clause};`;

      const result = await client.query(query, field_values);
      const product = result.rows[0] as Product;

      return product;
    } catch (error) {
      throw new ErrorResponse(400, `failed to find product by: ${field_names}`);
    } finally {
      client.release();
    }
  }

  static async findManyRandom(limit: number, offset: number) {
    const client = await pool.connect();

    try {
      const query = `
      SELECT 
          * 
      FROM 
          products  
      ORDER BY 
          RANDOM() 
      LIMIT ${limit} OFFSET ${offset};
      `;

      const result = await client.query(query);

      const products = result.rows;

      return products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to find random products");
    } finally {
      client.release();
    }
  }

  static async findManyByName(name: string, limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const tsquery_values = name.split(" ").join(" & ");

      const query = `
      SELECT
          *
      FROM
          products
      WHERE
          to_tsvector(product_name) @@ to_tsquery($1)
      LIMIT ${limit} OFFSET ${offset};
      `;

      const result = await client.query(query, [tsquery_values]);
      const products = result.rows as Product[];

      return products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to find products by name");
    } finally {
      client.release();
    }
  }

  static async findManyByFields(
    fields: Record<string, any>,
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
    const field_values = SqlHelper.getFieldValues(fields);
    const where_clause = SqlHelper.buildWhereClause(fields);

    try {
      const query = `SELECT * FROM products WHERE ${where_clause} LIMIT ${limit} OFFSET ${offset};`;

      const result = await client.query(query, field_values);
      const products = result.rows as Product[];

      return products;
    } catch (error) {
      throw new ErrorResponse(400, `failed to find product by: ${field_names}`);
    } finally {
      client.release();
    }
  }

  static async findManyByCategories(
    categories: string | string[],
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();

    try {
      if (!Array.isArray(categories)) {
        categories = [categories];
      }

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(categories);

      const query = `
      SELECT 
          p.*
      FROM 
          products AS p
      INNER JOIN 
          categories_on_products AS cop ON cop.product_id = p.product_id
      INNER JOIN
          categories AS c ON c.category_id = cop.category_id
      WHERE
          c.category_name IN (${parameterized_queries})
      GROUP BY
          p.product_id
      ORDER BY
          COUNT(p.product_id) DESC
      LIMIT ${limit} OFFSET ${offset};
      `;

      const result = await client.query(query, categories);
      const products = result.rows;

      return products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to find products by categories");
    } finally {
      client.release();
    }
  }

  static async findWithCategoriesById(product_id: number) {
    const client = await pool.connect();
    try {
      const query = `
      SELECT 
          p.*, c.category_name AS categories
      FROM
          products AS p
      INNER JOIN 
          categories_on_products AS cop ON cop.product_id = p.product_id
      INNER JOIN
          categories AS c ON c.category_id = cop.category_id
      WHERE
          p.product_id = $1;
      `;

      const result = await client.query(query, [product_id]);
      const products = result.rows as Product[];

      const product = ProductHelper.transformWithCategories(products)[0];

      return product;
    } catch (error) {
      throw new ErrorResponse(400, "failed to find products with categories");
    } finally {
      client.release();
    }
  }

  static async findManyRandomWithCategories(limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const query = `
      WITH unique_products AS (
        SELECT
            p.product_id
        FROM
            products AS p
        INNER JOIN
            categories_on_products AS cop ON cop.product_id = p.product_id
        INNER JOIN
            categories AS c ON c.category_id = cop.category_id
        GROUP BY
            p.product_id
        LIMIT ${limit} OFFSET ${offset}
      )
      SELECT
          p.*, c.category_name AS categories
      FROM
          products AS p
      INNER JOIN
          categories_on_products AS cop ON cop.product_id = p.product_id
      INNER JOIN
          categories AS c ON c.category_id = cop.category_id
      WHERE 
          p.product_id IN (SELECT product_id FROM unique_products)
      ORDER BY
          RANDOM();
      `;

      const result = await client.query(query);
      let products = result.rows as Product[];

      products = ProductHelper.transformWithCategories(products);

      return products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to find products random");
    } finally {
      client.release();
    }
  }

  static async findManyWithCategoriesByCategories(
    categories: string | string[],
    limit: number,
    offset: number
  ) {
    const client = await pool.connect();

    try {
      if (!Array.isArray(categories)) {
        categories = [categories];
      }

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(categories);

      const query = `
      WITH unique_products AS (
        SELECT 
            p.product_id
        FROM
            products AS p
        INNER JOIN
            categories_on_products AS cop ON cop.product_id = p.product_id
        INNER JOIN
            categories AS c ON c.category_id = cop.category_id
        WHERE
            c.category_name IN (${parameterized_queries}) 
        GROUP BY 
            p.product_id
        LIMIT ${limit} OFFSET ${offset}
      )
        SELECT 
            p.*, c.category_name AS categories
        FROM
            products AS p
        INNER JOIN 
            categories_on_products AS cop ON cop.product_id = p.product_id
        INNER JOIN 
            categories AS c ON c.category_id = cop.category_id
        WHERE
            p.product_id IN (SELECT product_id FROM unique_products);
      `;

      const result = await client.query(query, categories);
      let products = result.rows;

      products = ProductHelper.transformWithCategories(products);

      return products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to get products with categories");
    } finally {
      client.release();
    }
  }

  static async findManyDeleted(limit: number, offset: number) {
    const client = await pool.connect();
    try {
      const query = `SELECT * FROM deleted_products LIMIT ${limit} OFFSET ${offset}`;

      const result = await client.query(query);
      const products = result.rows;

      return products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to find deleted products");
    } finally {
      client.release();
    }
  }

  static async count() {
    const client = await pool.connect();

    try {
      const query = `SELECT CAST(COUNT(product_id) AS INTEGER) FROM products;`;

      const result = await client.query(query);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to count products");
    } finally {
      client.release();
    }
  }

  static async countByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    try {
      const where_clause = SqlHelper.buildWhereClause(fields);
      const field_values = SqlHelper.getFieldValues(fields);

      const query = `
      SELECT 
          CAST(COUNT(product_id) AS INTEGER) 
      FROM 
          products 
      WHERE 
          ${where_clause};`;

      const result = await client.query(query, field_values);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to count products by fields");
    } finally {
      client.release();
    }
  }

  static async countByName(name: string) {
    const client = await pool.connect();
    try {
      const tsquery_values = name.split(" ").join(" & ");

      const query = `
      SELECT
          CAST(COUNT(product_id) AS INTEGER)
      FROM
          products
      WHERE
          to_tsvector(product_name) @@ to_tsquery($1);
      `;

      const result = await client.query(query, [tsquery_values]);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to count products by name");
    } finally {
      client.release();
    }
  }

  static async countByCategories(categories: string | string[]) {
    const client = await pool.connect();

    try {
      if (!Array.isArray(categories)) {
        categories = [categories];
      }

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(categories);

      const query = `
      SELECT 
          CAST(COUNT(DISTINCT p.product_id) AS INTEGER)
      FROM
          products AS p
      INNER JOIN
          categories_on_products AS cop ON cop.product_id = p.product_id
      INNER JOIN 
          categories AS c ON c.category_id = cop.category_id
      WHERE 
          c.category_name IN (${parameterized_queries});
      `;

      const result = await client.query(query, categories);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to count products by categories");
    } finally {
      client.release();
    }
  }

  static async countDeleted() {
    const client = await pool.connect();
    try {
      const query = `SELECT CAST(COUNT(product_id) AS INTEGER) FROM deleted_products;`;

      const result = await client.query(query);
      const total_products = result.rows[0].count;

      return total_products;
    } catch (error) {
      throw new ErrorResponse(400, "failed to count deleted products");
    } finally {
      client.release();
    }
  }

  static async restore(product_id: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION;");

      // delete product
      let query = `DELETE FROM deleted_products WHERE product_id = ${product_id} RETURNING *;`;

      let result = await client.query(query);
      let product = result.rows[0];

      if (!product) {
        throw new ErrorResponse(404, "product not found");
      }

      // delete categories on deleted product
      query = `DELETE FROM categories_on_deleted_products WHERE product_id = ${product_id} RETURNING *;`;

      result = await client.query(query);
      const categories_on_products = result.rows;

      let field_names = SqlHelper.getFieldNames(product);
      const field_values = SqlHelper.getFieldValues(product);

      const parameterized_queries =
        SqlHelper.buildParameterizedQueries(product);

      // create product
      query = `INSERT INTO products(${field_names}) VALUES(${parameterized_queries}) RETURNING *;`;

      result = await client.query(query, field_values);
      product = result.rows[0];

      if (!categories_on_products.length) {
        return product;
      }

      field_names = SqlHelper.getFieldNames(categories_on_products[0]);

      const values_placeholders = SqlHelper.buildValuesPlaceholders(
        categories_on_products
      );

      // create categories on product
      query = `INSERT INTO categories_on_products(${field_names}) VALUES ${values_placeholders}`;
      await client.query(query);

      await client.query("COMMIT TRANSACTION;");

      return product;
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw new ErrorResponse(400, "failed to restore product");
    } finally {
      client.release();
    }
  }

  static async updateById(fields: Record<string, any>, product_id: number) {
    const client = await pool.connect();

    try {
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

      return product;
    } catch (error) {
      throw new ErrorResponse(400, "failed to update product by fields");
    } finally {
      client.release();
    }
  }

  static async delete(product_id: number) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN TRANSACTION;");

      let query = `DELETE FROM categories_on_products WHERE product_id = $1 RETURNING category_id;`;

      let result = await client.query(query, [product_id]);

      const categories_ids = result.rows.map(({ category_id }) => {
        return { category_id, product_id };
      });

      query = `DELETE FROM products WHERE product_id = $1 RETURNING *;`;

      result = await client.query(query, [product_id]);
      const product = result.rows[0];

      let field_names = SqlHelper.getFieldNames(product);
      let parameterized_queries = SqlHelper.buildParameterizedQueries(product);
      let field_values = SqlHelper.getFieldValues(product);

      query = `
      INSERT INTO 
          deleted_products(${field_names})
      VALUES 
          (${parameterized_queries})
      RETURNING *;
      `;

      result = await client.query(query, field_values);

      const values_placeholders =
        SqlHelper.buildValuesPlaceholders(categories_ids);

      field_values = SqlHelper.getFieldValues(categories_ids);

      query = `
      INSERT INTO 
          categories_on_deleted_products(category_id, product_id)
      VALUES 
          ${values_placeholders}
      RETURNING *;
      `;

      result = await client.query(query, field_values);

      await client.query("COMMIT TRANSACTION;");
    } catch (error) {
      await client.query("ROLLBACK TRANSACTION;");
      throw new ErrorResponse(400, "failed to delete product");
    } finally {
      client.release();
    }
  }
}
