import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import "dotenv/config";
import ErrorResponse from "../error/response.error";

export class AuthHelper {
  static generateOtp() {
    const otp = Math.round(Math.random() * 1000000)
      .toString()
      .padStart(6, "0"); // membuat otp 6 digit

    return otp;
  }

  static createAccessToken(user: any) {
    const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;

    if (!JWT_ACCESS_TOKEN_SECRET) {
      throw new ErrorResponse(422, "access token secret is not provided");
    }

    const access_token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    return access_token;
  }

  static createRefreshToken() {
    const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

    if (!JWT_REFRESH_TOKEN_SECRET) {
      throw new ErrorResponse(422, "refresh token secret is not provided");
    }

    const refresh_token = jwt.sign(
      {
        id: uuidv4(),
      },
      JWT_REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    return refresh_token;
  }

  static async comparePassword(
    password: string,
    encrypt_password: string | null | undefined
  ) {
    if (!encrypt_password) {
      throw new ErrorResponse(404, "the user does not have a password");
    }

    const compare_password = await bcrypt.compare(password, encrypt_password);

    if (!compare_password) {
      throw new ErrorResponse(401, "password or username is incorrect");
    }
  }

  static verifyOtp = (requestOtp: string, existingOtp: string) => {
    const compare_otp = requestOtp === existingOtp;

    if (!compare_otp) {
      throw new ErrorResponse(400, "otp is invalid");
    }
  };
}
