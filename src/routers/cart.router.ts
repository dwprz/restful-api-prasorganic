import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { CartController } from "../controllers/cart.controller";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";

const cartRouter = express.Router();
// all
cartRouter.post("/api/carts/items", verifyTokenMiddleware, CartController.create);
cartRouter.get("/api/carts", verifyTokenMiddleware, verifyAdminMiddleware, CartController.get);
cartRouter.get("/api/carts/users/current", verifyTokenMiddleware, CartController.getByCurrentUser);
cartRouter.get("/api/carts/products/:productName", verifyTokenMiddleware, verifyAdminMiddleware, CartController.getByProduct);
cartRouter.delete("/api/carts/items/:cartItemId", verifyTokenMiddleware, CartController.deleteItem);

export default cartRouter;
