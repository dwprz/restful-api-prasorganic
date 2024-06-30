import { Review } from "../interfaces/review.interface";

export class ReviewHighlightHelper {
  static mappingForCache(data: Review[]) {
    let dummy_reviews: Record<string, string> = {};

    data.forEach((review) => {
      dummy_reviews[`${review.user_id}:${review.product_id}`] = JSON.stringify({
        ...review,
      });
    });

    return dummy_reviews;
  }

  static parseCache(data: Record<string, string>) {
    return Object.values(data).map((review) => JSON.parse(review));
  }
}
