import "dotenv/config";
import { EnvHelper } from "./env.helper";
import { Order } from "../interfaces/order.interface";

export class MidtransHelper {
  static createTransactionData(data: Order) {
    const FRONT_END_URL = process.env.FRONT_END_URL;

    EnvHelper.validate({ FRONT_END_URL });

    const transaction_data = {
      transaction_details: {
        order_id: data.order_id,
        gross_amount: data.gross_amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        customer_name: data.buyer,
        email: data.email,
        whatsapp: data.whatsapp,
      },
      callbacks: {
        finish: `${FRONT_END_URL}/order-status?orderId=${data.order_id}`,
        error: `${FRONT_END_URL}/order-status?orderId=${data.order_id}`,
        pending: `${FRONT_END_URL}/order-status?orderId=${data.order_id}`,
      },
    };

    return transaction_data;
  }
}
