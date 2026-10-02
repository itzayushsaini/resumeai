import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { getAuth, type SessionUser } from "../auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: SessionUser;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await getAuth().api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    res.status(401).json({ error: "You need to sign in first." });
    return;
  }
  req.user = session.user;
  next();
}

/** For handlers mounted behind requireAuth. */
export function currentUser(req: Request): SessionUser {
  if (!req.user) throw new Error("currentUser() called on a route without requireAuth");
  return req.user;
}
