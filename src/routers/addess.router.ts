import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { AddressController } from "../controllers/address.controller";
import authMiddleware from "../middlewares/auth.middleware";

const addressRouter = express.Router();
// all
addressRouter.post("/api/addresses", authMiddleware, verifyTokenMiddleware, AddressController.create);
addressRouter.get("/api/addresses/user/:userId", authMiddleware, verifyTokenMiddleware, AddressController.get);
addressRouter.put("/api/addresses/:addressId", authMiddleware, verifyTokenMiddleware, AddressController.update);
addressRouter.delete("/api/addresses/:addressId", authMiddleware, verifyTokenMiddleware, AddressController.delete);

export default addressRouter;