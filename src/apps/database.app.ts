import pg from "pg";
import "dotenv/config";
import { EnvHelper } from "../helpers/env.helper";

const { Pool } = pg;

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;

EnvHelper.validate({ DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME });

const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;

