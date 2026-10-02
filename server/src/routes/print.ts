import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { Resume, toResumeDTO } from "../models/resume";
import { verifyPrintToken } from "../lib/print-token";
import { HttpError, notFound } from "../lib/http-error";

/** Used only by the headless browser during PDF export. */
export const printRouter = Router();

printRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!isValidObjectId(id)) throw notFound("Resume not found");
  if (!verifyPrintToken(id, token)) throw new HttpError(403, "Print link expired");
  const doc = await Resume.findById(id);
  if (!doc) throw notFound("Resume not found");
  res.setHeader("Cache-Control", "no-store");
  res.json(toResumeDTO(doc));
});
