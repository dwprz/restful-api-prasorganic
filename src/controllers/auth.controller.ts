import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserRequest } from "../interfaces/user.interface";

export class AuthController {
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.sendOtp(req.body.email);
      res.status(200).json({ data: "sent otp successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.verifyOtp(req.body);
      res.status(200).json({ data: "verified otp successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await AuthService.login(req.body);

      res.cookie("access_token", tokens.access_token, { httpOnly: true });
      res.cookie("refresh_token", tokens.refresh_token, { httpOnly: true });

      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  static async loginWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, tokens } = await AuthService.loginWithGoogle(req.body);

      res.cookie("access_token", tokens.access_token, { httpOnly: true });
      res.cookie("refresh_token", tokens.refresh_token, { httpOnly: true });

      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  static async refreshAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const refresh_token = req.cookies["refresh_token"];

      if (!refresh_token) {
        return res.status(401).json({ error: "refresh token is required " });
      }

      const { access_token, user } = await AuthService.generateNewAccessToken(
        refresh_token
      );

      res.cookie("access_token", access_token, { httpOnly: true });

      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = (req as UserRequest).user_data;
      await AuthService.clearRefreshToken(email);

      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      res.status(200).json({ data: "logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = (req as UserRequest).user_data;
      await AuthService.authenticate({ ...req.body, email });

      res.status(200).json({ data: "authenticated user successfully" });
    } catch (error) {
      next(error);
    }
  }
}
