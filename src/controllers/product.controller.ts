import { NextFunction, Request, Response } from "express";
import { RequestHelper } from "../helpers/request.helper";
import { ProductService } from "../services/product.service";
import { FileHelper } from "../helpers/file.helper";
import { DeletedProductService } from "../services/deleted-product.service";
import { CategoryService } from "../services/category.service";

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      req.body = RequestHelper.parse(req.body);

      const result = await ProductService.create(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      FileHelper.deleteByUrl(req.body.image);
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query["page"]);

      const categories = req.query["category"] as string | string[] | undefined;

      let name = req.query["name"]
        ? decodeURIComponent(req.query["name"] as string)
        : undefined;

      let result;

      if (name) {
        result = await ProductService.getByName({ name, page });
      } else if (categories) {
        result = await ProductService.getByCategories({ categories, page });
      } else {
        result = await ProductService.getRandom(page);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getTop(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getTop();

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getWithCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = Number(req.query["page"]);
      const categories = req.query["category"] as string | string[] | undefined;

      const { data, paging } = categories
        ? await ProductService.getWithCategoriesByCategories({
            categories,
            page,
          })
        : await ProductService.getRandomWithCategories(page);

      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async getDeleted(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query["page"]);

      const { data, paging } = await DeletedProductService.get(page);
      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const product_id = Number(req.params["productId"]);

      const result = await DeletedProductService.restore(product_id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product_id = Number(req.params["productId"]);

      const result = await ProductService.update({ ...req.body, product_id });
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateImage(req: Request, res: Response, next: NextFunction) {
    try {
      const product_id = Number(req.params["productId"]);

      const result = await ProductService.updateImage({
        ...req.body,
        product_id,
      });

      res.status(200).json({ data: result });
    } catch (error) {
      FileHelper.deleteByPath(req.file?.path);
      next(error);
    }
  }

  static async updateCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product_id = Number(req.params["productId"]);

      const result = await CategoryService.update({
        ...req.body,
        product_id,
      });

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const product_id = Number(req.params["productId"]);

      await ProductService.delete(product_id);

      res.status(200).json({ data: "deleted product successfully" });
    } catch (error) {
      next(error);
    }
  }
}
