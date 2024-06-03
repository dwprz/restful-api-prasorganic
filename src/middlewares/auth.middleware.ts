import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { EnvHelper } from "../helpers/env.helper";
import ErrorResponse from "../error/response.error";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;
    EnvHelper.validate({ AUTHORIZATION_SECRET });

    if (req.headers.authorization !== AUTHORIZATION_SECRET) {
      throw new ErrorResponse(401, "unauthorized");
    }

    next();
  } catch (error: any) {
    return res.status(error.status).json({ error: error.message });
  }
}

export default authMiddleware;
