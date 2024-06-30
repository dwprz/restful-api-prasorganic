import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../interfaces/user.interface";
import { ReviewService } from "../services/review.service";
import { ReviewInput } from "../interfaces/review.interface";

export class ReviewController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;

      req.body = req.body.map((data: ReviewInput) => {
        return { ...data, user_id };
      });

      await ReviewService.create(req.body);
      res.status(201).json({ data: "created reviews successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query["page"]);

      const rating = Number(req.query["rating"]);
      const product_name = req.query["productName"] as string;

      let result;

      if (rating) {
        result = await ReviewService.getByRating(rating, page);
      } else if (product_name) {
        result = await ReviewService.getByProductName(product_name, page);
      } else {
        result = await ReviewService.get(page);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReviewService.getHighlights();

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateHighlight(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await ReviewService.updateHighlight(req.body);

      res.status(200).json({ data: "updated highlight reviews successfully" });
    } catch (error) {
      next(error);
    }
  }
}
