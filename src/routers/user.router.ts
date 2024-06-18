import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";
import { UserController } from "../controllers/user.controller";
import uploadImageMiddleware from "../middlewares/upload-image.middleware";
import validateImageMiddleware from "../middlewares/validate-image.middleware";
import formatImageUrlMiddleware from "../middlewares/format-image-url.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const userRouter = express.Router();
// admin
userRouter.get("/api/users", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, UserController.getByRole);
userRouter.get("/api/users/full-name/:fullName", authMiddleware, verifyTokenMiddleware, verifyAdminMiddleware, UserController.getByFullName);

// all
userRouter.get("/api/users/current", authMiddleware, verifyTokenMiddleware, UserController.getCurrent);
userRouter.patch("/api/users/current", authMiddleware, verifyTokenMiddleware, UserController.updateProfile);
userRouter.patch("/api/users/current/password", authMiddleware, verifyTokenMiddleware, UserController.updatePassword);
userRouter.patch("/api/users/current/email", authMiddleware, verifyTokenMiddleware, UserController.updateEmail);
userRouter.patch("/api/users/current/photo-profile", authMiddleware, verifyTokenMiddleware, uploadImageMiddleware, validateImageMiddleware, formatImageUrlMiddleware, UserController.updatePhotoProfile);

export default userRouter;