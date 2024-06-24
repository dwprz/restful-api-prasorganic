import { Redis } from "ioredis";
import { EnvHelper } from "../helpers/env.helper";
import "dotenv/config";
import { ConsoleHelper } from "../helpers/console.helper";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_DB = process.env.REDIS_DB;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

EnvHelper.validate({ REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_PASSWORD });

const redis: Redis = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: REDIS_PASSWORD,
});

redis.on("error", (error) => {
  ConsoleHelper.error("redis", error);
});

export default redis;
