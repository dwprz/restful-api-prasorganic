import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { AddressController } from "../controllers/address.controller";

const addressRouter = express.Router();
// all
addressRouter.post("/api/addresses", verifyTokenMiddleware, AddressController.create);
addressRouter.get("/api/addresses/user/:userId", verifyTokenMiddleware, AddressController.get);
addressRouter.put("/api/addresses/:addressId", verifyTokenMiddleware, AddressController.update);
addressRouter.delete("/api/addresses/:addressId", verifyTokenMiddleware, AddressController.delete);

export default addressRouter;