import { NextFunction, Request, Response } from "express";
import { userService } from "../../services/user/user.service";
import ResponseError from "../../error/error";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers["authorization"];
    const authorizationSecret = process.env.AUTHORIZATION_SECRET;

    if (!authorization || authorization !== authorizationSecret) {
      throw new ResponseError(401, "unauthorized");
    }

    const result = await userService.create(req.body);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.get(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  register,
  login,
};
