import express from "express";
import { AuthController } from "../controllers/auth.controller";
import verifyTokenMiddleware from "../middlewares/verify-token.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const authRouter = express.Router();
authRouter.use(authMiddleware);
// all
authRouter.post("/api/users/current/login", AuthController.login);
authRouter.post("/api/users/current/refresh-token", AuthController.refreshAccessToken);
authRouter.patch("/api/users/current/logout", verifyTokenMiddleware, AuthController.logout);
authRouter.post("/api/users/current/authenticate", verifyTokenMiddleware, AuthController.authenticate);
authRouter.post("/api/users/current/otp", AuthController.sendOtp);
authRouter.post("/api/users/current/otp/verify", AuthController.verifyOtp);

// user
authRouter.post("/api/users/current/register", AuthController.register);
authRouter.post("/api/users/current/login/google", AuthController.loginWithGoogle);

export default authRouter;