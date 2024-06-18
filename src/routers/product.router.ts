import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import uploadImageMiddleware from "../middlewares/upload-image.middleware";
import { ProductController } from "../controllers/product.controller";
import verifySuperAdminMiddleware from "../middlewares/verify-super-admin.middleware";
import validateImageMiddleware from "../middlewares/validate-image.middleware";
import formatImageUrlMiddleware from "../middlewares/format-image-url.middleware";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";
import authMiddleware from "../middlewares/auth.middleware";


const productRouter = express.Router();
// super admin
productRouter.post("/api/products", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, uploadImageMiddleware, validateImageMiddleware, formatImageUrlMiddleware, ProductController.create);
productRouter.post("/api/products/deleted/:productId/restore", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, ProductController.restore);
productRouter.patch("/api/products/:productId", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, ProductController.update);
productRouter.patch("/api/products/:productId/image", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, uploadImageMiddleware, validateImageMiddleware, formatImageUrlMiddleware, ProductController.updateImage);
productRouter.patch("/api/products/:productId/categories", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, ProductController.updateCategories);
productRouter.delete("/api/products/:productId", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, ProductController.delete);

// admin & super admin
productRouter.get("/api/products-with-categories", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, ProductController.getWithCategories);
productRouter.get("/api/products/deleted", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, ProductController.getDeleted);

// all
productRouter.get("/api/products", authMiddleware, ProductController.get);
productRouter.get("/api/top-products", authMiddleware, ProductController.getTop);

export default productRouter;