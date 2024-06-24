import { NextFunction, Request, Response } from "express";
import "dotenv/config";
import crypto from "crypto";
import ErrorResponse from "../errors/response.error";

function verifyShippingNotificationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY;
    const APP_BASE_URL = process.env.APP_BASE_URL;
    const response_format = "json";

    const hash = crypto
      .createHash("MD5")
      .update(
        `${SHIPPER_API_KEY}${APP_BASE_URL}/api/shippings/notifications${response_format}`
      )
      .digest("hex");

    const shipping_auth = req.body.auth;

    if (hash !== shipping_auth) {
      throw new ErrorResponse(401, "invalid authentication");
    }

    next();
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }

    res.status(500).json({ error: "internal server error, try again later" });
  }
}

export default verifyShippingNotificationMiddleware;
