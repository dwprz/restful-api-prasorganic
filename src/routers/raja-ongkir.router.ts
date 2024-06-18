import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { RajaOngkirController } from "../controllers/raja-ongkir.controller";
import authMiddleware from "../middlewares/auth.middleware";

const rajaOngkirRouter = express.Router();
// all
rajaOngkirRouter.post("/api/raja-ongkir/shipping-rate", authMiddleware, verifyTokenMiddleware, RajaOngkirController.createShippingRate);
rajaOngkirRouter.get("/api/raja-ongkir/provinces", authMiddleware, verifyTokenMiddleware, RajaOngkirController.getProvinces);
rajaOngkirRouter.get("/api/raja-ongkir/cities", authMiddleware, verifyTokenMiddleware, RajaOngkirController.getCities);
rajaOngkirRouter.get("/api/raja-ongkir/subdistricts", authMiddleware, verifyTokenMiddleware, RajaOngkirController.getSubdistricts);
rajaOngkirRouter.get("/api/raja-ongkir/waybill", authMiddleware, verifyTokenMiddleware, RajaOngkirController.getWaybill);

export default rajaOngkirRouter;