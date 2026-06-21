import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { Role } from "../../types/domain";
import { AppError } from "../../utils/app-error";
import { comparePassword, hashPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";

const publicUser = (user: { id: string; name: string; email: string; role: Role }) => user;

export class AuthService {
  async register(input: { name: string; email: string; password: string; role: Role }) {
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash, role: input.role },
      select: { id: true, name: true, email: true, role: true }
    });
    return this.issueTokens(publicUser(user));
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    return this.issueTokens(publicUser(user));
  }

  async refresh(refreshToken: string) {
    const stored = await prisma.authToken.findUnique({ where: { refreshToken }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }
    verifyRefreshToken(refreshToken);
    return this.issueTokens(publicUser(stored.user));
  }

  async logout(refreshToken: string) {
    await prisma.authToken.updateMany({ where: { refreshToken }, data: { revokedAt: new Date() } });
  }

  private async issueTokens(user: { id: string; name: string; email: string; role: Role }) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await prisma.authToken.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + env.JWT_REFRESH_DAYS * 24 * 60 * 60 * 1000)
      }
    });
    return { user, accessToken, refreshToken };
  }
}

export const authService = new AuthService();
