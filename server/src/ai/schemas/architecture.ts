import { z } from "zod";

/**
 * Supported Zerops service "types" DevPilot is allowed to provision.
 * Kept intentionally narrow per hackathon scope (React/Vite static + Node.js API + PostgreSQL,
 * with Python as an optional extra). Grounded in https://docs.zerops.io (runtimes + managed services).
 */
export const SUPPORTED_ZEROPS_TYPES = [
  "static",
  "nodejs@22",
  "nodejs@20",
  "python@3.12",
  "postgresql@16",
  "valkey@7.2",
] as const;

export const ServiceRoleEnum = z.enum(["frontend", "backend", "database", "cache"]);

export const ServiceSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(25)
    .regex(/^[a-z][a-z0-9]*$/, "Service hostname must be lowercase alphanumeric, starting with a letter (Zerops hostname rules)"),
  technology: z.string().min(1).max(60),
  zeropsType: z.enum(SUPPORTED_ZEROPS_TYPES),
  role: ServiceRoleEnum,
  port: z.number().int().min(10).max(65435).nullable().optional().transform((v) => v ?? undefined),
  dependsOn: z.array(z.string()).default([]),
  reason: z.string().max(240).nullable().optional().transform((v) => v ?? undefined),
});

export const ArchitectureSchema = z.object({
  projectName: z
    .string()
    .min(2)
    .max(25)
    .regex(/^[a-z][a-z0-9-]*$/, "Project name must be lowercase alphanumeric/hyphen"),
  summary: z.string().min(1).max(400),
  services: z.array(ServiceSchema).min(1).max(6),
  unsupported: z
    .array(z.string())
    .default([])
    .describe("Requirements the user asked for that DevPilot cannot safely support in this hackathon build"),
});

export type Architecture = z.infer<typeof ArchitectureSchema>;
export type ArchitectureService = z.infer<typeof ServiceSchema>;

export const DiagnosisSchema = z.object({
  summary: z.string().min(1).max(300),
  rootCause: z.string().min(1).max(500),
  category: z.enum(["build_failure", "runtime_failure", "health_check_failure", "network_configuration_failure", "unknown"]),
  severity: z.enum(["low", "medium", "high"]),
  recommendedFix: z.string().min(1).max(600),
  safeActions: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
      })
    )
    .default([]),
  confidence: z.enum(["low", "medium", "high"]),
  couldAutoResolve: z.boolean(),
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;
