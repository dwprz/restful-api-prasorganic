import pool from "../apps/postgresql.app";
import Redis, { Cluster } from "ioredis";
import Bull from "bull";
import { EnvHelper } from "../helpers/env.helper";
import { ShippingService } from "../services/shipping.service";
import { OrderCache } from "../cache/order.cache";
import { OrderService } from "../services/order.service";
import { ConsoleHelper } from "../helpers/console.helper";
import "dotenv/config";

const REDIS_IP_NODE_1 = process.env.REDIS_IP_NODE_1;
const REDIS_IP_NODE_2 = process.env.REDIS_IP_NODE_2;
const REDIS_IP_NODE_3 = process.env.REDIS_IP_NODE_3;
const REDIS_IP_NODE_4 = process.env.REDIS_IP_NODE_4;
const REDIS_IP_NODE_5 = process.env.REDIS_IP_NODE_5;
const REDIS_IP_NODE_6 = process.env.REDIS_IP_NODE_6;

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_DB = process.env.REDIS_DB;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

EnvHelper.validate({
  REDIS_IP_NODE_1,
  REDIS_IP_NODE_2,
  REDIS_IP_NODE_3,
  REDIS_IP_NODE_4,
  REDIS_IP_NODE_5,
  REDIS_IP_NODE_6,
  REDIS_PORT,
  REDIS_DB,
  REDIS_PASSWORD,
});

export const orderShippingRedisClients: Cluster[] = [];

export const orderShippingQueue = new Bull("order-shipping", {
  prefix: "{order-shipping}",
  createClient() {
    const redis = new Redis.Cluster(
      [
        { host: REDIS_IP_NODE_1, port: Number(REDIS_PORT) },
        { host: REDIS_IP_NODE_2, port: Number(REDIS_PORT) },
        { host: REDIS_IP_NODE_3, port: Number(REDIS_PORT) },
        { host: REDIS_IP_NODE_4, port: Number(REDIS_PORT) },
        { host: REDIS_IP_NODE_5, port: Number(REDIS_PORT) },
        { host: REDIS_IP_NODE_6, port: Number(REDIS_PORT) },
      ],
      {
        redisOptions: {
          password: REDIS_PASSWORD,
          db: Number(REDIS_DB),
        },
      }
    );

    orderShippingRedisClients.push(redis);
    return redis;
  },
  defaultJobOptions: {
    delay: 5000, // 30 minutes
    timeout: 3000, // 30 seconds
    attempts: 3,
    backoff: {
      type: "fixed",
      delay: 6000, // 1 minutes per error
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
