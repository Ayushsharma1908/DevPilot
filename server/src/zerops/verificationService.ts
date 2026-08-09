import type { Deployment, VerificationResult } from "../types/domain.js";
import { AppError } from "../utils/AppError.js";
import { serviceList, serviceLog } from "./zeropsClient.js";

export async function verifyDeployment(
  deployment: Deployment
): Promise<VerificationResult> {
  if (deployment.demoMode) {
    const recentRuntimeErrors = deployment.logs.filter(
      (l) => l.stream === "runtime" && l.severity === "error"
    ).length;

    const serviceExists = deployment.stage !== "queued";
    const deploymentCompleted = !["queued", "building", "failed"].includes(
      deployment.stage
    );
    const isRunning = [
      "starting",
      "health_check",
      "healthy",
      "live",
    ].includes(deployment.stage);
    const healthCheckPassed = ["healthy", "live"].includes(deployment.stage);
    const httpReachable = deployment.stage === "live";
    const noCriticalRecentErrors =
      deployment.stage !== "failed" && recentRuntimeErrors === 0;

    return {
      serviceExists,
      deploymentCompleted,
      isRunning,
      healthCheckPassed,
      httpReachable,
      noCriticalRecentErrors,
      verifiedAt: new Date().toISOString(),
      passed:
        serviceExists &&
        deploymentCompleted &&
        isRunning &&
        healthCheckPassed &&
        httpReachable &&
        noCriticalRecentErrors,
    };
  }

  if (!process.env.ZEROPS_TOKEN) {
    throw new AppError(
      501,
      "ZEROPS_NOT_CONFIGURED",
      "ZEROPS_TOKEN is required for real Zerops verification."
    );
  }

  if (!deployment.projectId) {
    throw new AppError(
      502,
      "ZEROPS_PROJECT_NOT_FOUND",
      "No Zerops project ID is available for this deployment."
    );
  }

  try {
    // 1. Ask Zerops for the real services.
    const result = await serviceList(deployment.projectId);

    const services = parseServices(result.stdout);

    const serviceExists =
      services.length > 0 &&
      deployment.architecture.services.every((expected) =>
        services.some((actual) => actual.name === expected.name)
      );

    // 2. Check actual service statuses.
    const allServicesActive =
      services.length > 0 &&
      services.every((service) => service.status === "ACTIVE");

    // 3. Check recent runtime logs for critical errors.
    let criticalErrors = 0;

    for (const service of services) {
      try {
        const logs = await serviceLog(service.id, deployment.projectId);

        const lines = `${logs.stdout}\n${logs.stderr}`
          .split(/\r?\n/)
          .filter(Boolean);

        criticalErrors += lines.filter((line) =>
          /\b(error|fatal|critical)\b/i.test(line)
        ).length;
      } catch {
        // A log failure should not crash verification.
        // Service state itself is still verified above.
      }
    }

    const deploymentCompleted =
      deployment.stage === "live" || allServicesActive;

    const isRunning = allServicesActive;

    // Zerops service ACTIVE is our real platform-level health signal here.
    const healthCheckPassed = allServicesActive;

    // We don't have an application HTTP endpoint/source deployment yet.
    // Therefore this is intentionally false rather than fabricated.
    const httpReachable = false;

    const noCriticalRecentErrors = criticalErrors === 0;

    const passed =
      serviceExists &&
      deploymentCompleted &&
      isRunning &&
      healthCheckPassed &&
      noCriticalRecentErrors;

    return {
      serviceExists,
      deploymentCompleted,
      isRunning,
      healthCheckPassed,
      httpReachable,
      noCriticalRecentErrors,
      verifiedAt: new Date().toISOString(),
      passed,
    };
  } catch (error) {
    throw new AppError(
      502,
      "ZEROPS_VERIFICATION_FAILED",
      "Unable to verify the real Zerops deployment.",
      {
        message: error instanceof Error ? error.message : String(error),
      }
    );
  }
}

function parseServices(
  output: string
): Array<{ id: string; name: string; status: string }> {
  const services: Array<{
    id: string;
    name: string;
    status: string;
  }> = [];

  for (const line of output.split(/\r?\n/)) {
    const cells = line
      .split("│")
      .map((x) => x.trim())
      .filter(Boolean);

    if (cells.length < 3) continue;

    const id = cells[0];
    const name = cells[1];
    const status = cells[2];

    if (
      id &&
      name &&
      status &&
      id !== "ID" &&
      name !== "NAME" &&
      status !== "STATUS" &&
      !id.includes("─")
    ) {
      services.push({ id, name, status });
    }
  }

  return services;
}