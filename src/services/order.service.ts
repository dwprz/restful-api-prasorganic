import { OrderCache } from "../cache/order.cache";
import ErrorResponse from "../errors/response.error";
import { PagingHelper } from "../helpers/paging.helper";
import { OrderStatus, OrderWithProducts } from "../interfaces/order.interface";
import { OrderModelModify } from "../models/order/modify.model";
import { OrderModelRetrieve } from "../models/order/retrieve.model";
import { OrderValidation } from "../validations/schema/order.validation";
import validation from "../validations/validation";
import "dotenv/config";

export class OrderService {
  static async create(data: OrderWithProducts) {
    validation(OrderValidation.create, data);

    const order = await OrderModelModify.create(data);
    return order;
  }

  static async getById(order_id: string) {
    validation(OrderValidation.order_id, order_id);

    const order = await OrderModelRetrieve.findById(order_id);
    return order;
  }

  static async getByUserId(user_id: number, page: number) {
    validation(OrderValidation.getByUserId, { user_id, page });

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    const orders = await OrderModelRetrieve.findManyByUserId(
      user_id,
      limit,
      offset
    );

    const total_orders = await OrderModelRetrieve.countByFields({ user_id });

    const result = PagingHelper.formatPagedData(
      orders,
      total_orders,
      page,
      limit
    );

    return result;
  }

  static async getByStatus(status: OrderStatus | null, page: number) {
    validation(OrderValidation.getByStatus, { status, page });

    const { limit, offset } = PagingHelper.createLimitAndOffset(page);

    let orders: OrderWithProducts[];
    let total_orders: number;

    if (!status) {
      orders = await OrderModelRetrieve.findMany(limit, offset);

      total_orders = await OrderModelRetrieve.count();
    } else {
      orders = await OrderModelRetrieve.findManyByStatus(
        status!,
        limit,
        offset
      );

      total_orders = await OrderModelRetrieve.countByFields({ status });
    }

    const result = PagingHelper.formatPagedData(
      orders,
      total_orders,
      page,
      limit
    );

    return result;
  }

  static async addShippingId(order_id: string, shipping_id: string) {
    validation(OrderValidation.addShippingId, { order_id, shipping_id });

    const order = await OrderModelModify.updateById({ shipping_id }, order_id);
    return order;
  }

  static async cancel(user_id: number, order_id: string) {
    validation(OrderValidation.cancel, { user_id, order_id });

    let order = await OrderCache.findById(order_id);

    if (!order) {
      order = await OrderModelRetrieve.findById(order_id);
    }

    if (order.order.user_id !== user_id) {
      throw new ErrorResponse(
        403,
        "you do not have permission to cancel this order"
      );
    }

    if (order.order.status !== "PENDING_PAYMENT") {
      throw new ErrorResponse(400, "sorry, your order has been processed");
    }

    await OrderModelModify.updateById({ status: "CANCELLED" }, order_id);
  }

  static async updateStatus(status: OrderStatus, order_id: string) {
    validation(OrderValidation.update, { status, order_id });

    const order = await OrderModelModify.updateById({ status }, order_id);
    return order;
  }
}
