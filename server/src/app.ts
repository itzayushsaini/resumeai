import path from "node:path";
import { existsSync } from "node:fs";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";
import { type Auth, enabledSocialProviders } from "./auth";
import { env, isProduction } from "./env";
import { requireAuth } from "./middleware/require-auth";
import { resumesRouter } from "./routes/resumes";
import { printRouter } from "./routes/print";
import { HttpError } from "./lib/http-error";

export function createApp(auth: Auth) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Profile photos from Google or LinkedIn sign-in.
          "img-src": ["'self'", "data:", "https:"],
          // The host terminates HTTPS. Upgrading would break the PDF renderer,
          // which loads the print page over plain http on localhost.
          "upgrade-insecure-requests": null,
        },
      },
    }),
  );
  app.use(compression());

  // Better Auth reads the raw body itself, so it goes before express.json().
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json({ limit: "1mb" }));
  app.use(
    "/api",
    rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/config", (_req, res) => {
    res.json({
      socialProviders: enabledSocialProviders,
      aiEnabled: Boolean(env.GEMINI_API_KEY),
    });
  });

  app.use(
    "/api/resumes/:id/pdf",
    rateLimit({
      windowMs: 60_000,
      limit: 20,
      message: { error: "Too many downloads at once. Try again in a minute." },
    }),
  );
  app.use("/api/resumes", requireAuth, resumesRouter);
  app.use("/api/print", printRouter);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // In production the API also serves the built React app.
  const clientDist = path.resolve(import.meta.dirname, "../../client/dist");
  if (isProduction && existsSync(clientDist)) {
    app.use(
      "/assets",
      express.static(path.join(clientDist, "assets"), { immutable: true, maxAge: "1y" }),
    );
    app.use(express.static(clientDist, { index: false }));
    // Every other path is a client-side route.
    app.get("/{*splat}", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Some fields are invalid.", issues: error.issues });
      return;
    }
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    if (error?.type === "entity.too.large") {
      res.status(413).json({ error: "That request is too large." });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong on our side. Please try again." });
  };
  app.use(errorHandler);

  return app;
}
