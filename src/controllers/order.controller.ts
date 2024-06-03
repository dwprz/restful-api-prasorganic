// import { Request, Response, NextFunction } from "express";
// import { orderService } from "../../services/order.service";
// import { UserValidationRequest } from "../../interfaces/user";
// import { adminControllerUtil } from "../admin/admin.util";

// const create = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id, username } = (req as UserValidationRequest).userData;
//     req.body.order.user_id = id;
//     req.body.order.username = username;
//     const reqCreate = req.body;

//     const result = await orderService.create(reqCreate);
//     res.status(200).json({ data: result });
//   } catch (error) {
//     next(error);
//   }
// };

// const getByUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user_id = (req as UserValidationRequest).userData.id;

//     const result = await orderService.getByUser(user_id);
//     res.status(200).json({ data: result });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     adminControllerUtil.verifySuperAdmin(req);
//     const reqUpdate = req.body;

//     await orderService.updateStatus(reqUpdate);
//     res.status(200).json({ message: "success update status" });
//   } catch (error) {
//     next(error);
//   }
// };

// export const orderController = {
//   create,
//   getByUser,
//   updateStatus,
// };
