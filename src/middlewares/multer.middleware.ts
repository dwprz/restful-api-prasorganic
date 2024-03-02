import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const categoryDirectories: Record<string, string> = {
      fruits: "fruits",
      grains: "grains",
      parcels: "parcels",
      skincares: "skincares",
      vegetables: "vegetables",
    };

    const categoryDirectory =
      categoryDirectories[req.body.category.toLowerCase()] || "others";

    callback(null, __dirname + `/../../public/images/products/${categoryDirectory}`);
  },
  filename(req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
