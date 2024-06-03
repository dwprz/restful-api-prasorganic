import { Request, Response, NextFunction } from "express";
import ResponseError from "../error/response.error";
function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let status = 500;
  let message = "internal server error. please try again later";

  if (err instanceof ResponseError) {
    status = err.status;
    message = err.message;
  }

  console.log(`status: ${status}, message: ${err.message} | this log error`); 

  res.status(status).json({ error: message });
}

export default errorMiddleware;
