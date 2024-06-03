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
