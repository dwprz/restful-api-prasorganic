import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { RajaOngkirController } from "../controllers/raja-ongkir.controller";

const rajaOngkirRouter = express.Router();
// all
rajaOngkirRouter.post("/api/raja-ongkir/shipping-rate", verifyTokenMiddleware, RajaOngkirController.createShippingRate);
rajaOngkirRouter.get("/api/raja-ongkir/provinces", verifyTokenMiddleware, RajaOngkirController.getProvinces);
rajaOngkirRouter.get("/api/raja-ongkir/cities", verifyTokenMiddleware, RajaOngkirController.getCities);
rajaOngkirRouter.get("/api/raja-ongkir/subdistricts", verifyTokenMiddleware, RajaOngkirController.getSubdistricts);
rajaOngkirRouter.get("/api/raja-ongkir/waybill", verifyTokenMiddleware, RajaOngkirController.getWaybill);

export default rajaOngkirRouter;