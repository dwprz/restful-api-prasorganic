// import { Request, Response, NextFunction } from "express";
// import { cartService } from "../services/cart.service";
// import { UserValidationRequest } from "../interfaces/user";

// const create = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { body, userData } = req as UserValidationRequest;
//     body.user_id = userData.id;
//     const reqCreate = body;

//     const cart = await cartService.create(reqCreate);
//     res.status(200).json({ data: cart });
//   } catch (error) {
//     next(error);
//   }
// };

// const get = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user_id = (req as UserValidationRequest).userData.id;

//     const result = await cartService.get(user_id);
//     res.status(200).json({ data: result });
//   } catch (error) {
//     next(error);
//   }
// };

// const remove = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userData, params } = req as UserValidationRequest;
//     const user_id = userData.id;
//     const cart_id = Number(params.cartId);

//     const message = await cartService.remove(user_id, cart_id);
//     res.status(200).json({ message: message });
//   } catch (error) {
//     next(error);
//   }
// };

// export const cartController = {
//   create,
//   get,
//   remove,
// };
