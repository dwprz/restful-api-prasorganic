import { NextFunction, Request, Response, response } from "express";
import { productService } from "../../services/product/product.service";
import ResponseError from "../../error/error";
import { specifyDirectory } from "./product.util";
import { Query } from "../../types/product.types";

const add = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = process.env.AUTHORIZATION_ADMIN_SECRET;

    if (req.headers["authorization"] !== authorization) {
      throw new ResponseError(401, "unauthorized");
    }

    const data = req.body;
    const path = specifyDirectory(req);
    data.image = path;

    const result = await productService.create(data);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: Query = {
      page: Number(req.query.page),
      category: req.query.category?.toString(),
      search: req.query.search as string[] | string,
    };
    const result = await productService.get(query);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const productController = {
  add,
  get,
};
