import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const sub_folder = req.path.split("/")[2];

    callback(null, process.cwd() + `/public/images/${sub_folder}`);
  },

  filename(req, file, callback) {
    const encode_name = file.originalname.replace(/[ %?#&=]/g, "-");
    callback(null, Date.now() + "-" + encode_name);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // max 1 mb
  },
});

function uploadImageMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.single("image")(req, res, (error) => {
    if (error instanceof MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "file size is too large. max 1mb allowed" });
      }

      return res.status(400).json({ error: "failed to upload image" });
    } else if (error) {

      return res
        .status(500)
        .json({ error: "internal server error. please try again later" });
    } else {
      next();
    }
  });
}

export default uploadImageMiddleware;
