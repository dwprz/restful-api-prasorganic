import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { EnvHelper } from "../helpers/env.helper";
import ErrorResponse from "../errors/response.error";
import "dotenv/config";

function verifyTransactionNotificationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

    EnvHelper.validate({ MIDTRANS_SERVER_KEY });

    const data = req.body;
    const signature_key = req.body.signature_key;

    const hash = crypto
      .createHash("SHA512")
      .update(
        `${data.order_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`
      )
      .digest("hex");

    if (signature_key !== hash) {
      throw new ErrorResponse(401, "invalid signature key");
    }

    next();
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }

    res.status(500).json({ error: "internal server error, try again later" });
  }
}

export default verifyTransactionNotificationMiddleware;
