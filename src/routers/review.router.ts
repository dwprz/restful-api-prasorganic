import express from "express";
import authMiddleware from "../middlewares/auth.middleware";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import { ReviewController } from "../controllers/review.controller";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";
import verifySuperAdminMiddleware from "../middlewares/verify-super-admin.middleware";

const reviewRouter = express.Router();
// super admin
reviewRouter.patch("/api/reviews/highlights/current", authMiddleware, verifyTokenMiddleware, verifySuperAdminMiddleware, ReviewController.updateHighlight);

// admin
reviewRouter.get("/api/reviews", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, ReviewController.get);

// all
reviewRouter.post("/api/reviews", authMiddleware, verifyTokenMiddleware, ReviewController.create);
reviewRouter.get("/api/reviews/highlights", authMiddleware, ReviewController.getHighlights);

export default reviewRouter;