import Bull from "bull";
import pool from "../apps/postgresql.app";
import { EnvHelper } from "../helpers/env.helper";
import { ShippingService } from "../services/shipping.service";
import { OrderCache } from "../cache/order.cache";
import { OrderService } from "../services/order.service";
import { ConsoleHelper } from "../helpers/console.helper";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_DB = process.env.REDIS_DB;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

EnvHelper.validate({ REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_PASSWORD });

const orderShippingQueue = new Bull("order-shipping", {
  redis: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    db: Number(REDIS_DB),
    password: REDIS_PASSWORD,
  },
  defaultJobOptions: {
    delay: 60000 * 30, // 30 minutes
    timeout: 30000, // 30 seconds
    attempts: 3,
    backoff: {
      type: "fixed",
      delay: 60000, // 1 minutes per error
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
});

orderShippingQueue.process(async (job) => {
  const { order_id } = job.data;
  const client = await pool.connect();
  try {
    let order = await OrderCache.findById(order_id);

    if (!order) {
      order = await OrderService.getById(order_id);
    }

    const shipping_order = await ShippingService.orderShipping(order);

    const shipping_id = shipping_order.order_id;
    await OrderService.addShippingId(order_id, shipping_id);

    ConsoleHelper.log("successfully executed bull job for order shipping");
  } catch (error) {
    ConsoleHelper.error("bull job order shipping", error);
  } finally {
    client.release();
  }
});

export default orderShippingQueue;
