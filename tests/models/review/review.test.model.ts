import pool from "../../../src/apps/postgresql.app";
import { ReviewTestSubModel } from "./sub..test.model";

export class ReviewTestModel {
  static createInstance(user_id: number, product_id: number) {
    return {
      user_id: user_id,
      product_id: product_id,
      rating: 5,
      review: "good",
    };
  }

  static async create(user_id: number, product_id: number) {
    const client = await pool.connect();
    try {
      const review = this.createInstance(user_id, product_id) as any;

      await ReviewTestSubModel.insert(client, review);
    } catch (error) {
      console.log("review test model create", error.message);
    } finally {
      client.release();
    }
  }

  static async createHighlight(user_id: number, product_id: number) {
    const client = await pool.connect();
    try {
      const review = this.createInstance(user_id, product_id) as any;

      await ReviewTestSubModel.insert(client, {
        ...review,
        is_highlight: true,
      });
    } catch (error) {
      console.log("review test model create", error.message);
    } finally {
      client.release();
    }
  }

  static async delete(user_id: number, product_id: number) {
    const client = await pool.connect();
    try {
      let query = `
      DELETE FROM reviews WHERE user_id = $1 AND product_id = $2;
      `;

      await client.query(query, [user_id, product_id]);
    } catch (error) {
      console.log("review test model delete", error.message);
    } finally {
      client.release();
    }
  }
}
