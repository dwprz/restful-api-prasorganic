import { NextFunction, Request, Response } from "express";
import prismaClient from "../../applications/database";
import { cartService } from "../../services/cart/cart.service";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cartService.create(req.body);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cartService.update(req.body);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const cartController = {
  create,
  update,
};
