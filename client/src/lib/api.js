export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  status;
}

export async function api(path, { body, headers, ...init } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: "include",
      ...init,
      headers: body ? { "Content-Type": "application/json", ...headers } : headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) ||
      (response.status === 502 || response.status === 504
        ? "The API server isn't running. Start it with npm run dev."
        : `Request failed (${response.status})`);
    throw new ApiError(response.status, message);
  }
  return data;
}

export function errorMessage(error) {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
