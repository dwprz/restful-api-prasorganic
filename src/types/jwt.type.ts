import jwt from "jsonwebtoken";

export type ErrorJwt = jwt.VerifyErrors | null;

export type JwtDecoded = string | jwt.JwtPayload | undefined;

