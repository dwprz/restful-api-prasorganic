import express from "express";
import { ShippingController } from "../controllers/shipping.controller";
import authMiddleware from "../middlewares/auth.middleware";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";
import verifyShippingNotificationMiddleware from "../middlewares/verify-shipping-notification.middleware";
import verifySuperAdminMiddleware from "../middlewares/verify-super-admin.middleware";

const shippingRouter = express.Router();
// super admin
shippingRouter.delete("/api/shippings/:shippingId/orders/:orderId/cancellations", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, ShippingController.cancelOrderShipping);

// super admin & admin 
shippingRouter.post("/api/shippings/orders", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, ShippingController.manualShipping);
shippingRouter.post("/api/shippings/pickups", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, ShippingController.pickupsRequest);
shippingRouter.post("/api/shippings/labels", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, ShippingController.createLabel);

// all
shippingRouter.post("/api/shippings/pricings", authMiddleware, verifyTokenMiddleware, ShippingController.pricing);
shippingRouter.get("/api/shippings/:shippingId/trackings", authMiddleware, verifyTokenMiddleware, ShippingController.tracking);
shippingRouter.get("/api/shippings/provinces", authMiddleware, verifyTokenMiddleware, ShippingController.getProvinces);
shippingRouter.get("/api/shippings/cities", authMiddleware, verifyTokenMiddleware, ShippingController.getCities);
shippingRouter.get("/api/shippings/suburbs", authMiddleware, verifyTokenMiddleware, ShippingController.getSuburbs);
shippingRouter.get("/api/shippings/areas", authMiddleware, verifyTokenMiddleware, ShippingController.getAreas);

// webhook
shippingRouter.post("/api/shippings/notifications", verifyShippingNotificationMiddleware, ShippingController.notification);

export default shippingRouter;
