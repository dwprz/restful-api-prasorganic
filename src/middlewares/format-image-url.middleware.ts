import { NextFunction, Request, Response } from "express";
import { FileHelper } from "../helpers/file.helper";
import ErrorResponse from "../error/response.error";

function formatImageUrlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sub_folder = req.path.split("/")[2];
    const url = FileHelper.formatUrl("images", sub_folder, req.file?.filename);

    if (sub_folder === "users") {
      req.body.new_photo_profile = url;
    }

    if (sub_folder === "products") {
      req.method === "PATCH"
        ? (req.body.new_image = url)
        : (req.body.image = url);
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

export default formatImageUrlMiddleware;
