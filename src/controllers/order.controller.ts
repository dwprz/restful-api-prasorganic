import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../interfaces/user.interface";
import { OrderService } from "../services/order.service";
import { OrderStatus } from "../interfaces/order.interface";

export class OrderController {
  static async getByCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user_id } = (req as UserRequest).user_data;
      const page = Number(req.query["page"]);

      const { data, paging } = await OrderService.getByUserId(user_id, page);
      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async getByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = (req.query["status"] as OrderStatus) || null;
      const page = Number(req.query["page"]);

      const { data, paging } = await OrderService.getByStatus(status, page);
      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;
      const order_id = req.params["orderId"];

      await OrderService.cancel(user_id, order_id);

      res.status(200).json({ data: "cancelled order successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order_id = req.params["orderId"];
      const status = req.body.status;

      const result = await OrderService.updateStatus(status, order_id);

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
