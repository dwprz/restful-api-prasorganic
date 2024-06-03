import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../interfaces/user";
import { AddressService } from "../services/address.service";

export class AddressController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).userData;

      const result = await AddressService.create({ ...req.body, user_id });
      res.status(200).json({ data: result });
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
      const user_id = Number((req as UserRequest).userData.user_id);

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

// import { Request, Response, NextFunction } from "express";
// import { addressService } from "../../services/address.service";
// import { UserValidationRequest } from "../../interfaces/user";

// const create = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     req.body.user_id = (req as UserValidationRequest).userData.id;
//     const reqCreate = req.body;

//     const result = await addressService.create(reqCreate);
//     res.status(200).json({ data: result });
//   } catch (error) {
//     next(error);
//   }
// };

// const get = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user_id = (req as UserValidationRequest).userData.id;

//     const result = await addressService.get(user_id);
//     res.status(200).json({ data: result });
//   } catch (error) {
//     next(error);
//   }
// };

// const update = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     req.body.user_id = (req as UserValidationRequest).userData.id;
//     const reqUpdate = req.body;
//     reqUpdate.address_id = Number(req.params.addressId);

//     const result = await addressService.update(reqUpdate);
//     res.status(200).json({ data: result });
//   } catch (error) {
//     next(error);
//   }
// };

// const remove = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user_id = (req as UserValidationRequest).userData.id;
//     const address_id = Number(req.params.addressId);

//     const message = await addressService.remove(user_id, address_id);
//     res.status(200).json({ message: message });
//   } catch (error) {
//     next(error);
//   }
// };

// export const addressController = {
//   create,
//   get,
//   update,
//   remove,
// };
