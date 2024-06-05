import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { JwtPayload, UserRequest } from "../interfaces/user";
import { EnvHelper } from "../helpers/env.helper";

function verifyTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const access_token = req.cookies["access_token"];
    const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;

    EnvHelper.validate({ JWT_ACCESS_TOKEN_SECRET });

    if (!access_token) {
      return res.status(401).json({ error: "access token is required" });
    }

    const jwt_payload = jwt.verify(
      access_token,
      JWT_ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    (req as UserRequest).user_data = jwt_payload;
    next();
  } catch (error: any) {
    return res.status(error.status || 401).json({ error: error.message });
  }
}

export default verifyTokenMiddleware;
