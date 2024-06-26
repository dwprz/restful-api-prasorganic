import { Product } from "../../interfaces/product.interface";
import { SqlHelper } from "../../helpers/sql.helper";
import pool from "../../apps/postgresql.app";
import { ErrorHelper } from "../../helpers/error.helper";
import { TransformHelper } from "../../helpers/transform.helper";

export class ProductModelRetrieve {
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
      throw ErrorHelper.catch(`find product by ${field_names}`, error);
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
      throw ErrorHelper.catch("find random products", error);
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
      throw ErrorHelper.catch("find products by name", error);
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
      throw ErrorHelper.catch(`find product by ${field_names}`, error);
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
      throw ErrorHelper.catch("find products by categories", error);
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

      const product = TransformHelper.products(products)[0];

      return product;
    } catch (error) {
      throw ErrorHelper.catch("find products with categories", error);
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

      products = TransformHelper.products(products);

      return products;
    } catch (error) {
      throw ErrorHelper.catch("find products random", error);
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

      products = TransformHelper.products(products);

      return products;
    } catch (error) {
      throw ErrorHelper.catch("find products with categories", error);
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
      throw ErrorHelper.catch("find deleted products", error);
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
      throw ErrorHelper.catch("count products", error);
    } finally {
      client.release();
    }
  }

  static async countByFields(fields: Record<string, any>) {
    const client = await pool.connect();

    const field_names = SqlHelper.getFieldNames(fields);
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
      throw ErrorHelper.catch(`count products by ${field_names}`, error);
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
      throw ErrorHelper.catch("count products by name", error);
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
      throw ErrorHelper.catch("count products by categories", error);
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
      throw ErrorHelper.catch("count deleted products", error);
    } finally {
      client.release();
    }
  }
}
