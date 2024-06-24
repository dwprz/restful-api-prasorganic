// import express from "express";
// import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
// import { OrderController } from "../controllers/order.controller";
// import authMiddleware from "../middlewares/auth.middleware";
// import verifyTransactionNotificationMiddleware from "../middlewares/verify-transaction-notification.middleware";

// const orderRouter = express.Router();

// orderRouter.post("/api/orders", authMiddleware, verifyTokenMiddleware, OrderController.checkout);
// orderRouter.post("/api/orders/transaction/notification", verifyTransactionNotificationMiddleware, OrderController.transactionNotification);

// export default orderRouter;