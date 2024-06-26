import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { OrderController } from "../controllers/order.controller";
import authMiddleware from "../middlewares/auth.middleware";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";
import verifySuperAdminMiddleware from "../middlewares/verify-super-admin.middleware";

const orderRouter = express.Router();
// super admin
orderRouter.patch("/api/orders/:orderId/statuses", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, OrderController.updateStatus);

// admin & super admin
orderRouter.get("/api/orders", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, OrderController.getByStatus);

// all
orderRouter.get("/api/orders/users/current", authMiddleware, verifyTokenMiddleware, OrderController.getByCurrentUser);
orderRouter.patch("/api/orders/:orderId/cancellations", authMiddleware, verifyTokenMiddleware, OrderController.cancel);

export default orderRouter;