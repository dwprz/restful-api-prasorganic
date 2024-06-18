import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "../middlewares/error.middleware";
import cors from "cors";
import authRouter from "../routers/auth.router";
import userRouter from "../routers/user.router";
import productRouter from "../routers/product.router";
import addressRouter from "../routers/addess.router";
import cartRouter from "../routers/cart.router";
import rajaOngkirRouter from "../routers/raja-ongkir.router";
import orderRouter from "../routers/order.router";

const corsOpt = {
  credentials: true,
  origin: true,
};

const app = express();
app.use(cors(corsOpt));
app.use("/images/products", express.static(process.cwd() + "/public/images/products"));
app.use("/images/users", express.static(process.cwd() + "/public/images/users"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(authRouter);
app.use(userRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(addressRouter);
app.use(orderRouter);
app.use(rajaOngkirRouter);
app.use(errorMiddleware);

export default app;
