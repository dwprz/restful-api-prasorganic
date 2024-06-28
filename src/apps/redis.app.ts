import Redis from "ioredis";
import { EnvHelper } from "../helpers/env.helper";
import "dotenv/config";
import { ConsoleHelper } from "../helpers/console.helper";

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

redis.on("error", (error) => {
  ConsoleHelper.error("redis cluster", error);
});

export default redis;
