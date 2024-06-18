import express from "express";
import { AuthController } from "../controllers/auth.controller";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const authRouter = express.Router();
// all
authRouter.post("/api/users/current/login", authMiddleware, AuthController.login);
authRouter.post("/api/users/current/refresh-token", authMiddleware, AuthController.refreshAccessToken);
authRouter.patch("/api/users/current/logout", authMiddleware, verifyTokenMiddleware, AuthController.logout);
authRouter.post("/api/users/current/authenticate", authMiddleware, verifyTokenMiddleware, AuthController.authenticate);
authRouter.post("/api/users/current/otp", authMiddleware, AuthController.sendOtp);
authRouter.post("/api/users/current/otp/verify", authMiddleware, AuthController.verifyOtp);

// user
authRouter.post("/api/users/current/register", authMiddleware, AuthController.register);
authRouter.post("/api/users/current/login/google", authMiddleware, AuthController.loginWithGoogle);

export default authRouter;