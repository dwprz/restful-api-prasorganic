import express from "express";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import verifyAdminMiddleware from "../middlewares/verify-admin.middleware";
import { UserController } from "../controllers/user.controller";
import uploadImageMiddleware from "../middlewares/upload-image.middleware";
import validateImageMiddleware from "../middlewares/validate-image.middleware";
import formatImageUrlMiddleware from "../middlewares/format-image-url.middleware";

const userRouter = express.Router();
// admin
userRouter.get("/api/users", verifyTokenMiddleware, verifyAdminMiddleware, UserController.getByRole);
userRouter.get("/api/users/full-name/:fullName", verifyTokenMiddleware, verifyAdminMiddleware, UserController.getByFullName);

// all
userRouter.get("/api/users/current", verifyTokenMiddleware, UserController.getCurrent);
userRouter.patch("/api/users/current", verifyTokenMiddleware, UserController.updateProfile);
userRouter.patch("/api/users/current/password", verifyTokenMiddleware, UserController.updatePassword);
userRouter.patch("/api/users/current/email", verifyTokenMiddleware, UserController.updateEmail);
userRouter.patch("/api/users/current/photo-profile", verifyTokenMiddleware, uploadImageMiddleware, validateImageMiddleware, formatImageUrlMiddleware, UserController.updatePhotoProfile);

export default userRouter;