import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    tgId?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function verifyTelegramAuth(
  data: Record<string, any>,
  botToken: string
): boolean {
  const hash = String(data.hash || "");
  if (!hash) return false;

  const checkArr = Object.keys(data)
    .filter((k) => k !== "hash")
    .sort()
    .map((k) => `${k}=${String(data[k])}`);
  const checkString = checkArr.join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

  if (hmac !== hash) return false;

  const authDate = parseInt(String(data.auth_date || "0"), 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return false;
  }

  return true;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  next();
}
