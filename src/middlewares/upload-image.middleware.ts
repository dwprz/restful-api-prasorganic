import multer from "multer";

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

const uploadImageMiddleware = multer({
  storage: storage,
  limits: {
    fieldSize: 1 * 1024 * 1024, // max 1 mb
  },
});

export default uploadImageMiddleware;
