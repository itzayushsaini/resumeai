import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

/** Server features that depend on configuration: social sign-in and AI. */
export function useAppConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => api("/config"),
    staleTime: Infinity,
  });
}
