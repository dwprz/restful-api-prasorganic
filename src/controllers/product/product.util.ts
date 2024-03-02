import { Request } from "express";

export const specifyDirectory = (req: Request) => {
  const categoryDirectories: Record<string, string> = {
    fruits: "fruits",
    grains: "grains",
    parcels: "parcels",
    skincares: "skincares",
    vegetables: "vegetables",
  };

  const categoryDirectory =
    categoryDirectories[req.body.category.toLowerCase()] || "others";

  const path = `${req.protocol}://${req.get(
    "host"
  )}/images/products/${categoryDirectory}/${req.file?.filename}`;

  return path;
};
