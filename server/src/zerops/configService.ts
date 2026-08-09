import { stringify } from "yaml";
import type { Architecture, ArchitectureService } from "../ai/schemas/architecture.js";

/**
 * Builds one `setup` entry of zerops.yaml for a single service, following the
 * official structure: setup / build{base,buildCommands,deployFiles} / run{base,ports,start,healthCheck}.
 * Source of truth: https://docs.zerops.io/zerops-yaml/specification
 */
function buildServiceEntry(svc: ArchitectureService): Record<string, unknown> {
  if (svc.role === "frontend" && svc.zeropsType === "static") {
    return {
      setup: svc.name,
      build: {
        base: "nodejs@22",
        buildCommands: ["npm install", "npm run build"],
        deployFiles: ["dist/~"],
      },
      run: {
        base: "static",
      },
    };
  }

  if (svc.zeropsType.startsWith("nodejs")) {
    const port = svc.port ?? 3000;
    return {
      setup: svc.name,
      build: {
        base: svc.zeropsType,
        buildCommands: ["npm install", "npm run build"],
        deployFiles: ["dist", "package.json", "package-lock.json", "node_modules"],
      },
      run: {
        base: svc.zeropsType,
        ports: [{ port, httpSupport: true }],
        start: "npm start",
        healthCheck: {
          httpGet: { port, path: "/health" },
        },
      },
    };
  }

  if (svc.zeropsType.startsWith("python")) {
    const port = svc.port ?? 8000;
    return {
      setup: svc.name,
      build: {
        base: svc.zeropsType,
        buildCommands: ["pip install -r requirements.txt"],
        deployFiles: ["."],
      },
      run: {
        base: svc.zeropsType,
        ports: [{ port, httpSupport: true }],
        start: `uvicorn main:app --host 0.0.0.0 --port ${port}`,
        healthCheck: {
          httpGet: { port, path: "/health" },
        },
      },
    };
  }

  // Managed services (postgresql, valkey) are provisioned via Import YAML only —
  // they do not get a zerops.yaml build/run entry.
  return {};
}

export function generateZeropsYaml(architecture: Architecture): string {
  const entries = architecture.services
    .filter((s) => s.role === "frontend" || s.role === "backend")
    .map(buildServiceEntry)
    .filter((e) => Object.keys(e).length > 0);

  const doc = { zerops: entries };
  const header = "# yaml-language-server: $schema=https://api.app-prg1.zerops.io/api/rest/public/settings/zerops-yml-json-schema.json\n";
  return header + stringify(doc, { indent: 2 });
}
