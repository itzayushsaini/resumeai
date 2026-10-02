import { Router } from "express";
import { isValidObjectId } from "mongoose";
import {
  createBlankContent,
  createExampleContent,
  resumeCreateSchema,
  resumeSettingsSchema,
  resumeUpdateSchema,
  type TemplateId,
} from "@resumeai/shared";
import { Resume, toResumeDTO, type ResumeDocument } from "../models/resume";
import { currentUser } from "../middleware/require-auth";
import { HttpError, notFound } from "../lib/http-error";
import { createPrintToken } from "../lib/print-token";
import { pdfFilename, renderPdf } from "../lib/pdf";
import { env, isProduction } from "../env";

const MAX_RESUMES_PER_USER = 50;

/** Templates pair with a sensible default font. */
const TEMPLATE_FONTS: Record<TemplateId, "source-serif" | "ibm-plex-sans" | "carlito"> = {
  classic: "source-serif",
  modern: "ibm-plex-sans",
  minimal: "carlito",
};

export const resumesRouter = Router();

async function findOwned(userId: string, id: string): Promise<ResumeDocument> {
  if (!isValidObjectId(id)) throw notFound("Resume not found");
  const doc = await Resume.findOne({ _id: id, userId });
  if (!doc) throw notFound("Resume not found");
  return doc;
}

resumesRouter.get("/", async (req, res) => {
  const user = currentUser(req);
  const docs = await Resume.find({ userId: user.id }).sort({ updatedAt: -1 }).limit(MAX_RESUMES_PER_USER);
  res.json(docs.map(toResumeDTO));
});

resumesRouter.post("/", async (req, res) => {
  const user = currentUser(req);
  const input = resumeCreateSchema.parse(req.body ?? {});

  const count = await Resume.countDocuments({ userId: user.id });
  if (count >= MAX_RESUMES_PER_USER) {
    throw new HttpError(409, `You can keep up to ${MAX_RESUMES_PER_USER} resumes. Delete one to make room.`);
  }

  const template = input.template ?? "classic";
  const targetRole = input.targetRole ?? user.targetRole ?? "";
  const content =
    input.starter === "example"
      ? createExampleContent()
      : createBlankContent({ name: user.name, email: user.email, headline: targetRole });

  const doc = await Resume.create({
    userId: user.id,
    title: input.title ?? (input.starter === "example" ? "Example resume" : targetRole ? `${targetRole} resume` : "Untitled resume"),
    targetRole,
    content,
    settings: resumeSettingsSchema.parse({ template, font: TEMPLATE_FONTS[template] }),
  });
  res.status(201).json(toResumeDTO(doc));
});

resumesRouter.get("/:id", async (req, res) => {
  const doc = await findOwned(currentUser(req).id, req.params.id);
  res.json(toResumeDTO(doc));
});

resumesRouter.patch("/:id", async (req, res) => {
  const doc = await findOwned(currentUser(req).id, req.params.id);
  const update = resumeUpdateSchema.parse(req.body ?? {});
  if (update.title !== undefined) doc.title = update.title;
  if (update.targetRole !== undefined) doc.targetRole = update.targetRole;
  if (update.content !== undefined) doc.content = update.content;
  if (update.settings !== undefined) doc.settings = update.settings;
  await doc.save();
  res.json(toResumeDTO(doc));
});

resumesRouter.post("/:id/duplicate", async (req, res) => {
  const user = currentUser(req);
  const source = await findOwned(user.id, req.params.id);
  const count = await Resume.countDocuments({ userId: user.id });
  if (count >= MAX_RESUMES_PER_USER) {
    throw new HttpError(409, `You can keep up to ${MAX_RESUMES_PER_USER} resumes. Delete one to make room.`);
  }
  const copy = await Resume.create({
    userId: user.id,
    title: `${source.title} (copy)`.slice(0, 120),
    targetRole: source.targetRole,
    content: source.content,
    settings: source.settings,
  });
  res.status(201).json(toResumeDTO(copy));
});

resumesRouter.delete("/:id", async (req, res) => {
  const doc = await findOwned(currentUser(req).id, req.params.id);
  await doc.deleteOne();
  res.status(204).end();
});

resumesRouter.get("/:id/pdf", async (req, res) => {
  const doc = await findOwned(currentUser(req).id, req.params.id);
  const resume = toResumeDTO(doc);
  const token = createPrintToken(resume.id);
  // In production Express serves the client itself, so the headless browser can stay on localhost.
  const base = isProduction ? `http://127.0.0.1:${env.PORT}` : env.CLIENT_URL;
  const pdf = await renderPdf(`${base}/print/${resume.id}?token=${encodeURIComponent(token)}`);

  const filename = pdfFilename(resume);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  res.setHeader("Cache-Control", "no-store");
  res.send(Buffer.from(pdf));
});
