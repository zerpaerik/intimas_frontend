import { API_URL } from "@/lib/config";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Lee el token JWT desde la sesión persistida (sin acoplar al store). */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("intimas-session");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.session?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  // Sesión expirada / inválida → cerrar sesión (salvo en el propio login)
  if (res.status === 401 && !path.includes("/auth/login")) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("intimas-session");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  if (res.status === 204) return null as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message
      ? Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message
      : `Error ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del: <T = unknown>(path: string) => request<T>(path, { method: "DELETE" }),
};
