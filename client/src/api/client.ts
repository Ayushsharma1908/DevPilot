import type {
  Architecture,
  Deployment,
  Diagnosis,
  ProjectSummary,
  SimulatedFailure,
  ValidationResult,
} from "../types/domain";

const API_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    const err = new Error(message) as Error & {
      code?: string;
      details?: unknown;
    };

    err.code = body?.error?.code;
    err.details = body?.error?.details;

    throw err;
  }

  return body as T;
}

export const api = {
  health: () =>
    request<{
      status: string;
      demoMode: boolean;
      geminiConfigured: boolean;
    }>("/health"),

  analyzeArchitecture: (description: string) =>
    request<{
      architecture: Architecture;
      aiSource: "gemini" | "mock";
      validation: ValidationResult;
    }>("/architecture/analyze", {
      method: "POST",
      body: JSON.stringify({ description }),
    }),

  validateArchitecture: (architecture: Architecture) =>
    request<{ validation: ValidationResult }>("/architecture/validate", {
      method: "POST",
      body: JSON.stringify(architecture),
    }),

  generateConfig: (architecture: Architecture) =>
    request<{ importYaml: string; zeropsYaml: string }>("/config/generate", {
      method: "POST",
      body: JSON.stringify(architecture),
    }),

  createDeployment: (
    architecture: Architecture,
    simulateFailure: SimulatedFailure = "none",
  ) =>
    request<{ deployment: Deployment }>("/deployments", {
      method: "POST",
      body: JSON.stringify({ architecture, simulateFailure }),
    }),

  getDeployment: (id: string) =>
    request<{ deployment: Deployment }>(`/deployments/${id}`),

  listDeployments: () =>
    request<{ deployments: Deployment[] }>("/deployments"),

  verifyDeployment: (id: string) =>
    request<{ verification: Deployment["verification"] }>(
      `/deployments/${id}/verify`,
    ),

  diagnoseDeployment: (id: string) =>
    request<{ diagnosis: Diagnosis; aiSource: "gemini" | "mock" }>(
      `/deployments/${id}/diagnose`,
      { method: "POST" },
    ),

  retryDeployment: (id: string) =>
    request<{ deployment: Deployment }>(`/deployments/${id}/retry`, {
      method: "POST",
    }),

  listProjects: () =>
    request<{ projects: ProjectSummary[] }>("/projects"),
};