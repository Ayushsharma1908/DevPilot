import type { Deployment, LogLine, PipelineStage } from "../types/domain.js";
import { store } from "./store.js";
import { logger } from "../utils/logger.js";

const STAGE_ORDER: PipelineStage[] = ["queued", "building", "deploying", "starting", "health_check", "healthy", "live"];

function nowIso() {
  return new Date().toISOString();
}

function pushLog(deployment: Deployment, stream: LogLine["stream"], severity: LogLine["severity"], message: string) {
  deployment.logs.push({ ts: nowIso(), stream, severity, message });
}

function pushEvent(deployment: Deployment, type: string, message: string) {
  deployment.events.push({ ts: nowIso(), type, message });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SimulatedFailure = "none" | "missing_dependency" | "health_check_failure" | "db_connection_failure";

/**
 * Runs a simulated (DEMO_MODE) deployment pipeline against an in-memory deployment
 * record, mutating it as it progresses so polling clients see live-feeling status.
 * This is a controlled, clearly-labeled simulation — it never claims to be a real
 * Zerops deployment. It exists so the DevPilot demo works end-to-end without
 * requiring live Zerops credentials, per the hackathon's DEMO_MODE spec.
 */
export async function runSimulatedDeployment(deploymentId: string, simulateFailure: SimulatedFailure = "none") {
  const deployment = store.getDeployment(deploymentId);
  if (!deployment) return;

  const primaryService = deployment.architecture.services.find((s) => s.role === "backend") ?? deployment.architecture.services[0];

  pushEvent(deployment, "deployment_created", `Deployment queued for project "${deployment.projectName}" (simulated).`);
  store.upsertDeployment(deployment);

  for (const stage of STAGE_ORDER) {
    await delay(900 + Math.random() * 600);
    deployment.stage = stage;
    deployment.updatedAt = nowIso();

    if (stage === "building") {
      pushEvent(deployment, "build_started", "Build pipeline started (simulated).");
      pushLog(deployment, "build", "info", `[simulated] Preparing build environment for ${primaryService?.zeropsType ?? "service"}`);
      pushLog(deployment, "build", "info", "[simulated] Running buildCommands from zerops.yaml");

      if (simulateFailure === "missing_dependency") {
        pushLog(deployment, "build", "error", "[simulated] Error: Cannot find module 'express'");
        pushLog(deployment, "build", "error", "[simulated] npm run build exited with code 1");
        pushEvent(deployment, "build_failed", "Build failed: missing dependency (simulated failure).");
        deployment.stage = "failed";
        deployment.failureStage = "building";
        deployment.simulatedFailure = simulateFailure;
        deployment.updatedAt = nowIso();
        store.upsertDeployment(deployment);
        return;
      }

      pushLog(deployment, "build", "info", "[simulated] Build completed successfully");
      pushEvent(deployment, "build_succeeded", "Build completed (simulated).");
    }

    if (stage === "deploying") {
      pushEvent(deployment, "deploy_started", "Deploying build artifact to runtime container (simulated).");
      pushLog(deployment, "runtime", "info", "[simulated] Uploading deployFiles to /var/www");

      if (simulateFailure === "db_connection_failure") {
        pushLog(deployment, "runtime", "error", "[simulated] Error: connect ECONNREFUSED db:5432");
        pushLog(deployment, "runtime", "error", "[simulated] Database connection refused");
        pushEvent(deployment, "deploy_failed", "Deployment failed: database connection refused (simulated failure).");
        deployment.stage = "failed";
        deployment.failureStage = "deploying";
        deployment.simulatedFailure = simulateFailure;
        deployment.updatedAt = nowIso();
        store.upsertDeployment(deployment);
        return;
      }
    }

    if (stage === "starting") {
      pushEvent(deployment, "container_starting", "Starting application process (simulated).");
      pushLog(deployment, "runtime", "info", "[simulated] Running start command from zerops.yaml");
      pushLog(deployment, "runtime", "info", `[simulated] Application listening on port ${primaryService?.port ?? 3000}`);
    }

    if (stage === "health_check") {
      pushEvent(deployment, "health_check_started", "Running configured health check (simulated).");

      if (simulateFailure === "health_check_failure") {
        pushLog(deployment, "runtime", "warn", "[simulated] GET /health -> connection refused (attempt 1/3)");
        pushLog(deployment, "runtime", "warn", "[simulated] GET /health -> connection refused (attempt 2/3)");
        pushLog(deployment, "runtime", "error", "[simulated] GET /health -> connection refused (attempt 3/3)");
        pushEvent(deployment, "health_check_failed", "Health check failed after 3 attempts (simulated failure).");
        deployment.stage = "failed";
        deployment.failureStage = "health_check";
        deployment.simulatedFailure = simulateFailure;
        deployment.updatedAt = nowIso();
        store.upsertDeployment(deployment);
        return;
      }

      pushLog(deployment, "runtime", "info", "[simulated] GET /health -> 200 OK");
      pushEvent(deployment, "health_check_passed", "Health check passed (simulated).");
    }

    if (stage === "healthy") {
      pushEvent(deployment, "service_healthy", "Service reported healthy (simulated).");
    }

    if (stage === "live") {
      const slug = deployment.projectName.replace(/[^a-z0-9-]/g, "");
      deployment.liveUrl = `https://${slug}-${primaryService?.name ?? "app"}-${deployment.id.slice(0, 6)}.prg1.zerops.app`;
      pushEvent(deployment, "subdomain_enabled", `Public subdomain enabled (simulated): ${deployment.liveUrl}`);
    }

    store.upsertDeployment(deployment);
  }

  logger.info("simulated deployment reached live", { deploymentId, projectName: deployment.projectName });
}
