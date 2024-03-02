import express from "express";
import { productController } from "../controllers/product/product.controller";
import upload from "../middlewares/multer.middleware";
import { cartController } from "../controllers/cart/cart.controller";

const router = express.Router();

router.post("/api/products", upload.single("image"), productController.add);
router.get("/api/products", productController.get);
router.post("/api/cart", cartController.create);
router.patch("/api/cart", cartController.update);

export default router;
