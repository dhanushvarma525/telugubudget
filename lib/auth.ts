import * as jwt from "jsonwebtoken";

const SECRET = "telugubudget_secret";

export function createToken(payload: any) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}