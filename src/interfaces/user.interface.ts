import jwt from "jsonwebtoken";
import { Request } from "express";
import { Tokens } from "./token.interface";

export interface User {
  user_id: number;
  email: string;
  full_name: string;
  password?: string | null;
  role: UserRole;
  photo_profile: string | null;
  whatsapp: string | null;
  refresh_token?: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface UserRegister {
  email: string;
  full_name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserLoginWithGoogle {
  email: string;
  full_name: string;
  photo_profile: string | null;
}

export interface UsersByRole {
  page: number;
  role: UserRole;
}

export interface UsersByFullName {
  page: number;
  role: UserRole;
  full_name: string;
}

export interface UserUpdateProfile {
  email: string;
  full_name?: string;
  whatsapp?: string;
  password: string;
}

export interface UserUpdatePassword {
  email: string;
  new_password: string;
  password: string;
}

export interface UserUpdateEmail {
  email: string;
  new_email: string;
  otp: string;
}

export interface UserUpdatePhotoProfile {
  email: string;
  photo_profile: string | null;
  new_photo_profile: string;
}

export interface UserAutnenticate {
  email: string;
  password: string;
}

export interface UserSanitized {
  user_id: number;
  email: string;
  full_name: string;
  role: UserRole;
  photo_profile: string | null;
  whatsapp: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithTokens {
  user: UserSanitized;
  tokens: Tokens;
}

export interface UserRequest extends Request {
  user_data: JwtPayload;
}

export interface JwtPayload extends jwt.JwtPayload {
  user_id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}
