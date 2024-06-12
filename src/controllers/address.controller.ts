import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../interfaces/user";
import { AddressService } from "../services/address.service";

export class AddressController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;

      const result = await AddressService.create({ ...req.body, user_id });
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = Number(req.params["userId"]);

      const result = await AddressService.get(user_id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }


  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = Number((req as UserRequest).user_data.user_id);

      const result = await AddressService.update({ ...req.body, user_id });
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const address_id = Number(req.params["addressId"]);

      await AddressService.delete(address_id);
      res.status(200).json({ message: "deleted address successfully" });
    } catch (error) {
      next(error);
    }
  }
}
