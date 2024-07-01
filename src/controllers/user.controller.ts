import { NextFunction, Request, Response } from "express";
import { UserRequest, UserRole } from "../interfaces/user.interface";
import { UserService } from "../services/user.service";
import { FileHelper } from "../helpers/file.helper";
import { UserCache } from "../cache/user.cache";

export class UserController {
  static async getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = (req as UserRequest).user_data;

      let user = await UserCache.findById(user_id);

      if (!user) {
        user = await UserService.getById(user_id);
      }

      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query["page"]);
      const role = req.query["role"] as UserRole;

      const { data, paging } = await UserService.getByRole({ page, role });
      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async getByFullName(req: Request, res: Response, next: NextFunction) {
    try {
      const full_name = req.params["fullName"];
      const role = req.query["role"] as UserRole;
      const page = Number(req.query["page"]);

      const { data, paging } = await UserService.getByFullName({
        full_name,
        role,
        page,
      });

      res.status(200).json({ data, paging });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = (req as UserRequest).user_data;

      const result = await UserService.updateProfile({
        ...req.body,
        email,
      });

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updatePhotoProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email } = (req as UserRequest).user_data;

      const result = await UserService.updatePhotoProfile({
        ...req.body,
        email,
      });

      res.status(200).json({ data: result });
    } catch (error) {
      FileHelper.deleteByPath(req.file?.path);
      next(error);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = (req as UserRequest).user_data;
      await UserService.updatePassword({ ...req.body, email });

      res.status(200).json({ data: "updated password successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async updateEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = (req as UserRequest).user_data;

      const { user, access_token } = await UserService.updateEmail({
        ...req.body,
        email,
      });

      res.cookie("access_token", access_token, { httpOnly: true });
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}
