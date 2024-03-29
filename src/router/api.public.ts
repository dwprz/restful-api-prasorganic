import express from "express";
import { userController } from "../controllers/user/user";

const publicRouter = express.Router();

publicRouter.post("/api/users/register", userController.register);
publicRouter.post("/api/users/login", userController.login);

export default publicRouter;
