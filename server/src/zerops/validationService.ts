import { parse } from "yaml";
import type { Architecture } from "../ai/schemas/architecture.js";
import { SUPPORTED_ZEROPS_TYPES } from "../ai/schemas/architecture.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const RESERVED_HOSTNAMES = new Set(["zerops", "app", "internal"]);

export function validateArchitecture(architecture: Architecture): ValidationResult {
  const issues: ValidationIssue[] = [];
  const seenNames = new Set<string>();

  if (!architecture.services.length) {
    issues.push({ field: "services", message: "At least one service is required.", severity: "error" });
  }

  for (const svc of architecture.services) {
    if (seenNames.has(svc.name)) {
      issues.push({ field: `services.${svc.name}`, message: `Duplicate service hostname "${svc.name}".`, severity: "error" });
    }
    seenNames.add(svc.name);

    if (!/^[a-z][a-z0-9]*$/.test(svc.name)) {
      issues.push({ field: `services.${svc.name}`, message: "Hostname must be lowercase alphanumeric and start with a letter.", severity: "error" });
    }

    if (!(SUPPORTED_ZEROPS_TYPES as readonly string[]).includes(svc.zeropsType)) {
      issues.push({ field: `services.${svc.name}`, message: `Unsupported Zerops service type "${svc.zeropsType}".`, severity: "error" });
    }

    if (RESERVED_HOSTNAMES.has(svc.name)) {
      issues.push({ field: `services.${svc.name}`, message: `"${svc.name}" is a reserved hostname on Zerops.`, severity: "warning" });
    }

    if ((svc.role === "backend") && !svc.port) {
      issues.push({ field: `services.${svc.name}`, message: "Backend service is missing a port; a default will be assumed.", severity: "warning" });
    }

    for (const dep of svc.dependsOn) {
      if (!architecture.services.some((s) => s.name === dep)) {
        issues.push({ field: `services.${svc.name}`, message: `Depends on unknown service "${dep}".`, severity: "error" });
      }
    }
  }

  return { valid: !issues.some((i) => i.severity === "error"), issues };
}

export function validateYamlSyntax(label: "importYaml" | "zeropsYaml", yamlText: string): ValidationIssue[] {
  try {
    parse(yamlText);
    return [];
  } catch (err) {
    return [
      {
        field: label,
        message: `YAML failed to parse: ${err instanceof Error ? err.message : String(err)}`,
        severity: "error",
      },
    ];
  }
}
