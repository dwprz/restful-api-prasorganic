import { OrderWithProducts } from "../interfaces/order.interface";
import { OrderUtil } from "../utils/order.util";
import { OrderValidation } from "../validations/schema/order.validation";
import validation from "../validations/validation";
import "dotenv/config";

export class OrderService {
  static async create(data: OrderWithProducts) {
    validation(OrderValidation.create, data);

    const order_with_products = await OrderUtil.create(data);
    return order_with_products;
  }

  static async getById(order_id: string) {
    validation(OrderValidation.order_id, order_id);

    const order_with_products = await OrderUtil.findById(order_id);
    return order_with_products;
  }

  static async addShippingId(order_id: string, shipping_id: string) {
    validation(OrderValidation.addShippingId, { order_id, shipping_id });

    const order = await OrderUtil.updateById({ shipping_id }, order_id);
    return order;
  }
}
