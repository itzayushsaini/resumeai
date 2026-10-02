import { model, Schema } from "mongoose";
import type { ResumeContent, ResumeDTO, ResumeSettings } from "@resumeai/shared";

const resumeSchema = new Schema(
  {
    // Better Auth user id (stored as a string so it works with any id strategy).
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    targetRole: { type: String, default: "", maxlength: 120 },
    // Validated with the shared zod schema before every write.
    content: { type: Schema.Types.Mixed, required: true },
    settings: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

resumeSchema.index({ userId: 1, updatedAt: -1 });

export const Resume = model("Resume", resumeSchema);
export type ResumeDocument = ReturnType<(typeof Resume)["hydrate"]>;

export function toResumeDTO(doc: ResumeDocument): ResumeDTO {
  return {
    id: doc._id.toString(),
    title: doc.title,
    targetRole: doc.targetRole ?? "",
    content: doc.content as ResumeContent,
    settings: doc.settings as ResumeSettings,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
