import { fromNodeHeaders } from "better-auth/node";
import { getAuth } from "../auth.js";

export async function requireAuth(req, res, next) {
  const session = await getAuth().api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    res.status(401).json({ error: "You need to sign in first." });
    return;
  }
  req.user = session.user;
  next();
}

/** For handlers mounted behind requireAuth. */
export function currentUser(req) {
  if (!req.user) throw new Error("currentUser() called on a route without requireAuth");
  return req.user;
}
