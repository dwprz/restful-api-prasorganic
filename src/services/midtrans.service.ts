import axios from "axios";
import { EnvHelper } from "../helpers/env.helper";
import ErrorResponse from "../error/response.error";
import "dotenv/config";
import { MidtransHelper } from "../helpers/midtrans.helper";
import { OrderUtil } from "../utils/order.util";
import { Order, OrderStatus } from "../interfaces/order.interface";
import { ProductService } from "./product.service";

export class MidtransService {
  static async transaction(data: Order) {
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

    EnvHelper.validate({ MIDTRANS_SERVER_KEY });

    const transaction_data = MidtransHelper.createTransactionData(data);

    try {
      const response = await axios.post(
        "https://app.sandbox.midtrans.com/snap/v1/transactions",
        transaction_data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `basic ${btoa(MIDTRANS_SERVER_KEY!) + ":"}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new ErrorResponse(400, "failed transaction to midtrans");
    }
  }

  static async handleWebhook(data: Record<string, any>) {
    try {
      const transaction_status = data.transaction_status;
      const payment_method = data.payment_type;
      const order_id = data.order_id;

      if (
        (transaction_status === "capture" && data.fraud_status === "accept") ||
        transaction_status === "settlement"
      ) {
        const order = await OrderUtil.updateById(
          { payment_method, status: OrderStatus.PAID },
          order_id
        );

        return order;
      }

      if (transaction_status === "cancel") {
        await ProductService.rollbackStocks(order_id);

        const order = await OrderUtil.updateById(
          { status: OrderStatus.CANCELED },
          order_id
        );

        return order;
      }

      if (transaction_status === "deny" || transaction_status === "expire") {
        await ProductService.rollbackStocks(order_id);

        const order = await OrderUtil.updateById(
          { status: OrderStatus.FAILED },
          order_id
        );

        return order;
      }
    } catch (error) {
      return { error: error };
    }
  }
}
