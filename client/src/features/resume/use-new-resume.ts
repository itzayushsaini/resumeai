import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { ResumeCreate } from "@resumeai/shared";
import { errorMessage } from "@/lib/api";
import { useCreateResume } from "./api";

/** Creates a resume and opens it in the editor. */
export function useNewResume() {
  const navigate = useNavigate();
  const create = useCreateResume();

  async function start(input: ResumeCreate = {}) {
    try {
      const resume = await create.mutateAsync(input);
      navigate(`/resumes/${resume.id}/edit`);
      return resume;
    } catch (error) {
      toast.error(errorMessage(error));
      return null;
    }
  }

  return { start, pending: create.isPending, variables: create.variables };
}
