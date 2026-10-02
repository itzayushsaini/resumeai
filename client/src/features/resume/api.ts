import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ResumeCreate, ResumeDTO, ResumeUpdate } from "@resumeai/shared";
import { api, ApiError } from "@/lib/api";

export const resumeKeys = {
  all: ["resumes"] as const,
  detail: (id: string) => ["resumes", id] as const,
};

export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.all,
    queryFn: () => api<ResumeDTO[]>("/resumes"),
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn: () => api<ResumeDTO>(`/resumes/${id}`),
    staleTime: Infinity,
  });
}

function upsertInList(list: ResumeDTO[] | undefined, resume: ResumeDTO) {
  if (!list) return list;
  const rest = list.filter((r) => r.id !== resume.id);
  return [resume, ...rest];
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResumeCreate) => api<ResumeDTO>("/resumes", { method: "POST", body: input }),
    onSuccess: (resume) => {
      queryClient.setQueryData(resumeKeys.detail(resume.id), resume);
      queryClient.setQueryData<ResumeDTO[]>(resumeKeys.all, (list) => upsertInList(list, resume));
    },
  });
}

export function useDuplicateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<ResumeDTO>(`/resumes/${id}/duplicate`, { method: "POST" }),
    onSuccess: (resume) => {
      queryClient.setQueryData(resumeKeys.detail(resume.id), resume);
      queryClient.setQueryData<ResumeDTO[]>(resumeKeys.all, (list) => upsertInList(list, resume));
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ResumeUpdate }) => saveResume(id, patch),
    onSuccess: (resume) => {
      queryClient.setQueryData(resumeKeys.detail(resume.id), resume);
      queryClient.setQueryData<ResumeDTO[]>(resumeKeys.all, (list) => list?.map((r) => (r.id === resume.id ? resume : r)));
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/resumes/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: resumeKeys.all });
      const previous = queryClient.getQueryData<ResumeDTO[]>(resumeKeys.all);
      queryClient.setQueryData<ResumeDTO[]>(resumeKeys.all, (list) => list?.filter((r) => r.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(resumeKeys.all, context.previous);
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: resumeKeys.detail(id) });
    },
  });
}

export function saveResume(id: string, patch: ResumeUpdate, init?: { keepalive?: boolean }) {
  return api<ResumeDTO>(`/resumes/${id}`, { method: "PATCH", body: patch, keepalive: init?.keepalive });
}

/** Downloads the server-rendered PDF. */
export async function downloadResumePdf(id: string) {
  const response = await fetch(`/api/resumes/${id}/pdf`, { credentials: "include" });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, data?.error ?? "Couldn't create the PDF. Try again.");
  }
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = match?.[1] ?? "Resume.pdf";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
