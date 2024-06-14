import { Request, Response, NextFunction } from "express";
import ResponseError from "../error/response.error";
import { ZodError } from "zod";
import QueryError from "../error/query.error";

function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // error loging
  err instanceof QueryError
    ? console.log(`this log error: {${err.name}: ${err.message}}`)
    : console.log(`this log error: ${err.message}`);

  // error handling
  if (err instanceof ResponseError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.format() });
  }

  return res
    .status(500)
    .json({ error: "internal server error. please try again later" });
}

export default errorMiddleware;
