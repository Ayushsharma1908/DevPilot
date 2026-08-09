import { stringify } from "yaml";
import type { Architecture, ArchitectureService } from "../ai/schemas/architecture.js";

/**
 * Import YAML is Zerops' infrastructure-as-code format used with
 * `zcli project project-import` / `zcli project service-import` to create/import
 * project + service infrastructure. This is distinct from zerops.yaml (application
 * build/runtime config). Source of truth: https://docs.zerops.io/references/import
 */
function buildImportService(
  svc: ArchitectureService
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    hostname: svc.name,
    type: svc.zeropsType,
  };

  if (svc.role === "database") {
    base.mode = "NON_HA";
  } else {
    base.minContainers = 1;
    base.maxContainers = 1;
    base.startWithoutCode = true;
    base.enableSubdomainAccess = true;
  }

  return base;
}
export function generateImportYaml(architecture: Architecture): string {
  const doc = {
    project: {
      name: architecture.projectName,
    },
    services: architecture.services.map(buildImportService),
  };

  const header = "# see https://docs.zerops.io/references/import for full reference\n";
  return header + stringify(doc, { indent: 2 });
}
