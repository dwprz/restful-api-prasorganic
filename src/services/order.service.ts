import { OrderWithProducts } from "../interfaces/order.interface";
import { OrderUtil } from "../utils/order.util";
import { OrderValidation } from "../validations/schema/order.validation";
import validation from "../validations/validation";
import "dotenv/config";

export class OrderService {
  static async create(data: OrderWithProducts) {
    validation(OrderValidation.create, data);

    const order_details = await OrderUtil.create(data);
    return order_details;
  }
}
