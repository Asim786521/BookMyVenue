import jwt, { SignOptions, TokenExpiredError } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../types/domain";

export type JwtUser = {
  id: string;
  email: string;
  role: Role;
};

export const signAccessToken = (user: JwtUser) =>
  jwt.sign(user, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL } as SignOptions);

export const signRefreshToken = (user: JwtUser) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_DAYS}d`
  });

 
export const verifyAccessToken = (token: string): JwtUser | null => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.log("Token expired");
    }
    return null;
  }
};
export const verifyRefreshToken = (token: string): JwtUser | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUser;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.log("Refresh token expired");
    }
    return null;
  }
};
