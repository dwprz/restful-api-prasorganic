import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { FileHelper } from "../helpers/file.helper";
import ErrorResponse from "../errors/response.error";

const validateImageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await FileHelper.validateImageWithMagicNumber(req.file);

    next();
  } catch (error) {
    FileHelper.deleteByPath(req.file?.path);

    if (error instanceof ErrorResponse) {
      return res.status(error.status).json({ error: error.message });
    }

    return res
      .status(500)
      .json({ error: "internal server error. please try again later" });
  }
};

export default validateImageMiddleware;
