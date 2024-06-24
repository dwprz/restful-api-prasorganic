import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import verifyTransactionNotificationMiddleware from "../middlewares/verify-transaction-notification.middleware";
import { TransactionController } from "../controllers/transaction.controller";

const transactionRouter = express.Router();
// all
transactionRouter.post("/api/transactions", authMiddleware, verifyTokenMiddleware, TransactionController.transaction);

// webhook
transactionRouter.post("/api/transactions/notifications", verifyTransactionNotificationMiddleware, TransactionController.notification);

export default transactionRouter;