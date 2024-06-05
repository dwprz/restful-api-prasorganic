import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";
import { UserRequest } from "../interfaces/user";

export class CartController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;

      const cart = await CartService.create({ ...req.body, user_id });
      res.status(200).json({ data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query["page"]);

      const { data, paging } = await CartService.get(page);
      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async getByCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user_id } = (req as UserRequest).user_data;

      const result = await CartService.getByUserId(user_id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query["page"]);
      
      const product_name = decodeURIComponent(
        req.params["productName"] as string
      );

      const { data, paging } = await CartService.getByProductName({
        product_name,
        page,
      });

      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;
      const cart_item_id = Number(req.params["cartItemId"]);

      await CartService.deleteByUserAndItemId({ user_id, cart_item_id });

      res.status(200).json({ message: "deleted cart item successfully" });
    } catch (error) {
      next(error);
    }
  }
}