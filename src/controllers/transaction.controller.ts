import { NextFunction, Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { UserRequest } from "../interfaces/user.interface";
import { TransactionService } from "../services/transaction.service";
import { nanoid } from "nanoid";
import { ConsoleHelper } from "../helpers/console.helper";

export class TransactionController {
  static async transaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;

      const order_id = nanoid();

      const { token, redirect_url } = await TransactionService.transaction({
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

  static async notification(req: Request, res: Response, next: NextFunction) {
    try {
      TransactionService.handleWebhook(req.body)
        .then(() => {
          ConsoleHelper.log("success handle midtrans webhook");
        })
        .catch((error) => {
          ConsoleHelper.error("handle midtrans webhook", error);
        });

      res.status(200).json({ data: "OK" });
    } catch (error) {
      next(error);
    }
  }
}
