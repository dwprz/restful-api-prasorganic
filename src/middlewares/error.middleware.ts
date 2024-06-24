import { Request, Response, NextFunction } from "express";
import ResponseError from "../errors/response.error";
import { ZodError } from "zod";
import QueryError from "../errors/query.error";
import { HttpError } from "../errors/http.error";
import { ConsoleHelper } from "../helpers/console.helper";

function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // error loging
  err instanceof QueryError || err instanceof HttpError
    ? ConsoleHelper.error(err.name, err)
    : ConsoleHelper.error(undefined, err);

  // error handling
  if (err instanceof ResponseError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.format() });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: `failed to ${err.name}` });
  }

  return res
    .status(500)
    .json({ error: "internal server error. please try again later" });
}

export default errorMiddleware;
