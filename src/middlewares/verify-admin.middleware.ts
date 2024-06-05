import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../interfaces/user";

function verifyAdminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { role } = (req as UserRequest).user_data;

  role === "ADMIN" || role === "SUPER_ADMIN"
    ? next()
    : res.status(403).json({ error: "access denied" });
}

export default verifyAdminMiddleware;
