import express from "express";
import publicRouter from "../router/api.public";
import errorMiddleware from "../middlewares/error.middleware";
import cors from "cors";
import path from "path";
import router from "../router/api";

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
// };


const app = express();
app.use("/images/users", express.static(path.join(__dirname, "..", "..", "public", "images", "users")))
app.use("/images/products", express.static(path.join(__dirname, "..", "..", "public", "images", "products")))
app.use(cors());
app.use(express.json());
app.use(publicRouter);
app.use(router);
app.use(errorMiddleware);

export default app;
