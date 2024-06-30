import { ReviewHighlightCache } from "../cache/review-highlight.cache";
import ErrorResponse from "../errors/response.error";
import { PagingHelper } from "../helpers/paging.helper";
import {
  ReviewHighlightUpdate,
  ReviewInput,
} from "../interfaces/review.interface";
import { ReviewModelCount } from "../models/review/count.model";
import { ReviewModelModify } from "../models/review/modify.model";
import { ReviewModelRetrieve } from "../models/review/retrieve.model";
import { ReviewValidation } from "../validations/schema/review.validation";
import validation from "../validations/validation";

export class ReviewService {
  static async create(data: ReviewInput[]) {
    validation(ReviewValidation.create, data);

    await ReviewModelModify.create(data);
  }

  static async get(page: number) {
    validation(ReviewValidation.page, { page });

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const reviews = await ReviewModelRetrieve.findMany(limit, offset);
    const total_reviews = await ReviewModelCount.count();

    return PagingHelper.formatPagedData(reviews, total_reviews, page, limit);
  }

  static async getByRating(rating: number, page: number) {
    validation(ReviewValidation.getByRating, { rating, page });

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const reviews = await ReviewModelRetrieve.findManyByRating(
      rating,
      limit,
      offset
    );

    const total_reviews = await ReviewModelCount.countByRating(rating);
    return PagingHelper.formatPagedData(reviews, total_reviews, page, limit);
  }

  static async getByProductName(product_name: string, page: number) {
    validation(ReviewValidation.getByProductName, { product_name, page });

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const reviews = await ReviewModelRetrieve.findManyByProductName(
      product_name,
      limit,
      offset
    );

    const total_reviews = await ReviewModelCount.countByProductName(
      product_name
    );

    return PagingHelper.formatPagedData(reviews, total_reviews, page, limit);
  }

  static async getHighlights() {
    let reviews = await ReviewHighlightCache.findMany();

    if (!reviews) {
      reviews = await ReviewModelRetrieve.findManyByHighlight();
    }

    return reviews;
  }

  static async updateHighlight(data: ReviewHighlightUpdate) {
    validation(ReviewValidation.updateHighlight, data);

    const { user_id, product_id, is_highlight } = data;

    if (is_highlight === true) {
      const total_reviews = await ReviewModelCount.countByHighlight();

      if (total_reviews >= 8) {
        throw new ErrorResponse(400, "there are already 8 highlighted reviews");
      }
    }

    await ReviewModelModify.updateByFields(
      { is_highlight },
      user_id,
      product_id
    );
  }
}
