import * as jwt from "jsonwebtoken";

const SECRET = process.env.ADMIN_JWT_SECRET;

if (!SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not configured");
}

const JWT_SECRET: string = SECRET;

export function createToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}