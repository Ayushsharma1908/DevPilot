import { nanoid } from "nanoid";
import type { Architecture } from "../ai/schemas/architecture.js";
import type { Deployment, Project } from "../types/domain.js";
import { store } from "./store.js";
import { generateZeropsYaml } from "./configService.js";
import { generateImportYaml } from "./importService.js";
import { runSimulatedDeployment, type SimulatedFailure } from "./mockAdapter.js";
import { AppError } from "../utils/AppError.js";
import {
  projectImport,
  serviceList,
  serviceLog,
} from "./zeropsClient.js";
import { logger } from "../utils/logger.js";
const DEMO_MODE = (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false";

export function isDemoMode() {
  return DEMO_MODE;
}

export function createDeployment(
  architecture: Architecture,
  simulateFailure: SimulatedFailure = "none"
): Deployment {
  const deploymentId = nanoid(10);
  const now = new Date().toISOString();

  // Keep an internal ID for DevPilot's own tracking.
  const projectId = nanoid(10);

  const project: Project = {
    id: projectId,
    name: architecture.projectName,
    createdAt: now,
    deploymentIds: [deploymentId],
  };

  store.upsertProject(project);

  const deployment: Deployment = {
    id: deploymentId,
    projectId,
    projectName: architecture.projectName,
    architecture,
    importYaml: generateImportYaml(architecture),
    zeropsYaml: generateZeropsYaml(architecture),
    stage: "queued",
    demoMode: DEMO_MODE,
    createdAt: now,
    updatedAt: now,
    logs: [],
    events: [],
  };

  store.upsertDeployment(deployment);

  logger.info("deployment created", {
    requestId: deploymentId,
    project: architecture.projectName,
    operation: "create_deployment",
    status: "queued",
    demoMode: DEMO_MODE,
  });

  if (DEMO_MODE) {
    void runSimulatedDeployment(deploymentId, simulateFailure);
  } else {
    void runRealZeropsDeployment(deploymentId);
  }

  return deployment;
}

async function runRealZeropsDeployment(deploymentId: string) {
  const deployment = store.getDeployment(deploymentId);

  if (!deployment) {
    return;
  }

  try {
    deployment.stage = "building";
    deployment.updatedAt = new Date().toISOString();

    deployment.events.push({
      ts: new Date().toISOString(),
      type: "building",
      message: "Creating Zerops infrastructure...",
    });

    store.upsertDeployment(deployment);

    // Write generated import YAML to a temporary file.
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const os = await import("node:os");

    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "devpilot-")
    );

    const importPath = path.join(
      tempDir,
      "zerops-import.yaml"
    );

    await fs.writeFile(
      importPath,
      deployment.importYaml,
      "utf8"
    );

    // Create the real Zerops project and services.
    const result = await projectImport(importPath);

    deployment.logs.push({
      ts: new Date().toISOString(),
      stream: "build",
      severity: "info",
      message: result.stdout || "Zerops project imported successfully.",
    });

    deployment.stage = "deploying";
    deployment.updatedAt = new Date().toISOString();

    deployment.events.push({
      ts: new Date().toISOString(),
      type: "deploying",
      message: "Zerops project and services created.",
    });

    store.upsertDeployment(deployment);

    // Give Zerops a moment to finish provisioning.
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Discover services in the newly created project.
    //
    // project-import creates the project, but zCLI output does not give us
    // a clean machine-readable project ID. We therefore find the project
    // by name through the CLI.
    const projectsResult = await runZcliForDeployment([
      "project",
      "list",
    ]);

    const projectMatch = parseProjectId(
      projectsResult.stdout,
      deployment.projectName
    );

    if (projectMatch) {
      deployment.projectId = projectMatch;
    }

    if (!deployment.projectId) {
      throw new AppError(
        502,
        "ZEROPS_PROJECT_NOT_FOUND",
        "Zerops project was created but its project ID could not be determined."
      );
    }

    const servicesResult = await serviceList(
      deployment.projectId
    );

    const services = parseServices(servicesResult.stdout);

    deployment.zeropsServices = services.map((service) => {
      const architectureService =
        deployment.architecture.services.find(
          (s) => s.name === service.name
        );

      return {
        id: service.id,
        name: service.name,
        role: architectureService?.role ?? "unknown",
      };
    });

    deployment.logs.push({
      ts: new Date().toISOString(),
      stream: "build",
      severity: "info",
      message: `Discovered ${services.length} Zerops service(s).`,
    });

    deployment.stage = "starting";
    deployment.updatedAt = new Date().toISOString();

    deployment.events.push({
      ts: new Date().toISOString(),
      type: "starting",
      message: "Zerops services are ready.",
    });

    store.upsertDeployment(deployment);

    // At this point infrastructure is genuinely deployed.
    //
    // We intentionally do NOT push DevPilot's own source code into the
    // generated application services. DevPilot currently receives an
    // architecture description rather than an application repository.
    deployment.stage = "live";
    deployment.updatedAt = new Date().toISOString();

    deployment.events.push({
      ts: new Date().toISOString(),
      type: "live",
      message:
        "Infrastructure successfully provisioned on Zerops.",
    });

    deployment.logs.push({
      ts: new Date().toISOString(),
      stream: "runtime",
      severity: "info",
      message:
        "Real Zerops infrastructure is active. Application source deployment is not configured because no source repository was supplied.",
    });

    store.upsertDeployment(deployment);

    logger.info("real Zerops deployment completed", {
      deploymentId,
      projectId: deployment.projectId,
      services: deployment.zeropsServices,
    });
  } catch (error) {
    deployment.stage = "failed";
    deployment.failureStage = "deploying";
    deployment.updatedAt = new Date().toISOString();

    deployment.events.push({
      ts: new Date().toISOString(),
      type: "failed",
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });

    deployment.logs.push({
      ts: new Date().toISOString(),
      stream: "build",
      severity: "error",
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });

    store.upsertDeployment(deployment);

    logger.error("real Zerops deployment failed", {
      deploymentId,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}

export function getDeployment(id: string): Deployment {
  const deployment = store.getDeployment(id);
  if (!deployment) {
    throw new AppError(404, "DEPLOYMENT_NOT_FOUND", `No deployment found with id "${id}"`);
  }
  return deployment;
}

export function listDeployments(): Deployment[] {
  return store.listDeployments();
}

export function listProjects(): Project[] {
  return store.listProjects();
}

export function retryDeployment(id: string): Deployment {
  const prior = getDeployment(id);
  // Retry creates a fresh deployment attempt with the same architecture, without
  // the previously injected simulated failure — mirroring "fix and redeploy".
  return createDeployment(prior.architecture, "none");
}

async function runZcliForDeployment(args: string[]) {
  const { spawn } = await import("node:child_process");

  const zcliPath =
    process.env.ZCLI_PATH ??
    "C:\\Users\\Ayush\\.zerops\\bin\\zcli.exe";

  return new Promise<{ stdout: string; stderr: string }>(
    (resolve, reject) => {
      const child = spawn(zcliPath, args, {
        env: process.env,
        shell: false,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("error", (error) => {
        reject(
          new Error(`Failed to start zcli: ${error.message}`)
        );
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(
            new Error(
              `zcli ${args.join(" ")} failed: ${stderr || stdout}`
            )
          );
          return;
        }

        resolve({ stdout, stderr });
      });
    }
  );
}
function parseProjectId(
  output: string,
  projectName: string
): string | undefined {
  const lines = output.split(/\r?\n/);

  for (const line of lines) {
    if (!line.includes(projectName)) {
      continue;
    }

    // Zerops table:
    // │ PROJECT_ID │ PROJECT_NAME │ ...
    const cells = line
      .split("│")
      .map((x) => x.trim())
      .filter(Boolean);

    if (cells.length > 0) {
      return cells[0];
    }
  }

  return undefined;
}

function parseServices(
  output: string
): Array<{ id: string; name: string }> {
  const services: Array<{ id: string; name: string }> = [];

  for (const line of output.split(/\r?\n/)) {
    const cells = line
      .split("│")
      .map((x) => x.trim())
      .filter(Boolean);

    if (cells.length >= 3) {
      const id = cells[0];
      const name = cells[1];

      if (
        id &&
        name &&
        id !== "ID" &&
        name !== "NAME" &&
        !id.includes("─")
      ) {
        services.push({ id, name });
      }
    }
  }

  return services;
}