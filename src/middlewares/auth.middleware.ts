import { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { EnvHelper } from "../helpers/env.helper";
import ErrorResponse from "../errors/response.error";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET;
    EnvHelper.validate({ AUTHORIZATION_SECRET });

    if (req.headers.authorization !== AUTHORIZATION_SECRET) {
      throw new ErrorResponse(401, "unauthorized");
    }

    next();
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }

    return res
      .status(500)
      .json({ error: "internal server error. please try again later" });
  }
}

export default authMiddleware;
