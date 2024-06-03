import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { FileHelper } from "../helpers/file.helper";

const validateImageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await FileHelper.validateImageWithMagicNumber(req.file);

    next();
  } catch (error: any) {
    FileHelper.deleteByPath(req.file?.path);

    return res.status(error.status || 500).json({ error: error.message });
  }
};

export default validateImageMiddleware;
