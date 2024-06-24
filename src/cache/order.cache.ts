import redis from "../apps/redis.app";
import { ErrorHelper } from "../helpers/error.helper";
import { OrderWithProducts } from "../interfaces/order.interface";

export class OrderCache {
  static async cache(data: OrderWithProducts) {
    try {
      const order_id = data.order.order_id;

      await redis.setex(
        `order_id:${order_id}`,
        3600 * 24 * 7,
        JSON.stringify(data)
      );
    } catch (error) {
      throw ErrorHelper.catch("create order cache", error);
    }
  }

  static async findById(order_id: string) {
    try {
      const order_cache = await redis.get(`order_id:${order_id}`);

      if (!order_cache) {
        return null;
      }

      return JSON.parse(order_cache) as OrderWithProducts;
    } catch (error) {
      throw ErrorHelper.catch("find order cache by id", error);
    }
  }

  static async updateById(fields: Record<string, any>, order_id: string) {
    try {
      const order_cache = await this.findById(order_id);

      if (order_cache) {
        Object.keys(fields).forEach((property) => {
          (order_cache.order as any)[property] = fields[property];
        });

        await this.cache(order_cache);
      }
    } catch (error) {
      throw ErrorHelper.catch("update order cache by id", error);
    }
  }
}
