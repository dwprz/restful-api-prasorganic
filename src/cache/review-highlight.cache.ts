import redis from "../apps/redis.app";
import { ErrorHelper } from "../helpers/error.helper";
import { ReviewHighlightHelper } from "../helpers/review-highlight.helper";
import { Review } from "../interfaces/review.interface";

export class ReviewHighlightCache {
  static async cache(data: Review[]) {
    try {
      const mapped_reviews = ReviewHighlightHelper.mappingForCache(data);

      await redis.hset("highlighted-reviews", mapped_reviews);
    } catch (error) {
      throw ErrorHelper.catch("cache reviews", error);
    }
  }

  static async findById(user_id: number, product_id: number) {
    try {
      const reviews = await redis.hget(
        "highlighted-reviews",
        `${user_id}:${product_id}`
      );

      if (!reviews) {
        return null;
      }

      return JSON.parse(reviews) as Review;
    } catch (error) {
      throw ErrorHelper.catch("get review cache", error);
    }
  }

  static async findMany() {
    try {
      const reviews = await redis.hgetall("highlighted-reviews");

      if (Object.keys(reviews).length === 0) {
        return null;
      }

      return ReviewHighlightHelper.parseCache(reviews) as Review[];
    } catch (error) {
      throw ErrorHelper.catch("get all reviews highlight", error);
    }
  }

  static async update(data: Review) {
    try {
      if (!data.is_highlight) {
        return await this.delete(data.user_id, data.product_id);
      }

      const object = {
        [`${data.user_id}:${data.product_id}`]: JSON.stringify(data),
      };

      await redis.hset("highlighted-reviews", object);
    } catch (error) {
      throw ErrorHelper.catch("update review cache by id", error);
    }
  }

  static async delete(user_id: number, product_id: number) {
    try {
      await redis.hdel("highlighted-reviews", `${user_id}:${product_id}`);
    } catch (error) {
      throw ErrorHelper.catch("delete review highlight cache", error);
    }
  }
}
