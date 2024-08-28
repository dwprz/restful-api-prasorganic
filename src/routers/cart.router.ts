import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { CartController } from "../controllers/cart.controller";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const cartRouter = express.Router();
// admin
cartRouter.get("/api/carts", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, CartController.get);
cartRouter.get("/api/carts/products/:productName", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, CartController.getByProduct);

// all
cartRouter.post("/api/carts/items", authMiddleware, verifyTokenMiddleware, CartController.create);
cartRouter.get("/api/carts/users/current", authMiddleware, verifyTokenMiddleware, CartController.getByCurrentUser);
cartRouter.delete("/api/carts/items/:cartItemId", authMiddleware, verifyTokenMiddleware, CartController.deleteItem);

export default cartRouter;
