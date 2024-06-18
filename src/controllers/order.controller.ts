import { NextFunction, Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { UserRequest } from "../interfaces/user.interface";
import { MidtransService } from "../services/midtrans.service";
import { nanoid } from "nanoid";

export class OrderController {
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;

      const order_id = nanoid();

      const { token, redirect_url } = await MidtransService.transaction({
        ...req.body.order,
        user_id,
        order_id,
      });

      req.body.order.snap_token = token;
      req.body.order.snap_redirect_url = redirect_url;
      req.body.order.user_id = user_id;
      req.body.order.order_id = order_id;

      const result = await OrderService.create(req.body);

      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async transactionNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      MidtransService.handleWebhook(req.body).then((result) => {
        console.log("transaction notification | ", result);
      });

      res.status(200).json({ data: "OK" });
    } catch (error) {
      next(error);
    }
  }
}
