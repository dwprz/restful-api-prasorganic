import axios from "axios";
import { EnvHelper } from "../helpers/env.helper";
import "dotenv/config";
import { TransactionHelper } from "../helpers/transaction.helper";
import { OrderUtil } from "../utils/order.util";
import { Order, OrderStatus } from "../interfaces/order.interface";
import { ProductService } from "./product.service";
import { ErrorHelper } from "../helpers/error.helper";
import { ShippingService } from "./shipping.service";
import orderShippingQueue from "../queue/shipping.queue";

export class TransactionService {
  static async transaction(data: Order) {
    const MIDTRANS_BASE_URL = process.env.MIDTRANS_BASE_URL;
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

    EnvHelper.validate({ MIDTRANS_BASE_URL, MIDTRANS_SERVER_KEY });

    const transaction_data = TransactionHelper.formatTransactionData(data);

    try {
      const response = await axios.post(
        `${MIDTRANS_BASE_URL}/snap/v1/transactions`,
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
      throw ErrorHelper.catch("transaction midtrans", error);
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
        await OrderUtil.updateById(
          { payment_method, status: OrderStatus.PAID },
          order_id
        );

        orderShippingQueue.add({ order_id });
      }

      if (transaction_status === "cancel") {
        await ProductService.rollbackStocks(order_id);

        await OrderUtil.updateById({ status: OrderStatus.CANCELED }, order_id);
      }

      if (transaction_status === "deny" || transaction_status === "expire") {
        await ProductService.rollbackStocks(order_id);

        await OrderUtil.updateById({ status: OrderStatus.FAILED }, order_id);
      }
    } catch (error) {
      return { error: error };
    }
  }
}
