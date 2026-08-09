import { generateDiagnosis } from "../ai/geminiService.js";
import type { Deployment } from "../types/domain.js";
import { AppError } from "../utils/AppError.js";

/**
 * Failure recovery flow (spec STEP 11): collect evidence first (stage, logs,
 * verification), then send only sanitized evidence to Gemini — never raw
 * secrets/env values, and never let Gemini directly control Zerops.
 */
export async function diagnoseDeployment(deployment: Deployment) {
  if (deployment.stage !== "failed") {
    throw new AppError(400, "NOT_FAILED", "Diagnosis is only available for a deployment in the failed state.");
  }

  const primaryService = deployment.architecture.services.find((s) => s.role === "backend") ?? deployment.architecture.services[0];

  const buildLogs = deployment.logs.filter((l) => l.stream === "build").map((l) => `[${l.severity}] ${l.message}`);
  const runtimeLogs = deployment.logs.filter((l) => l.stream === "runtime").map((l) => `[${l.severity}] ${l.message}`);

  const { diagnosis, aiSource } = await generateDiagnosis({
    stage: deployment.failureStage ?? deployment.stage,
    serviceName: primaryService?.name ?? "unknown",
    buildLogs,
    runtimeLogs,
    verification: deployment.verification,
  });

  deployment.diagnosis = diagnosis;
  deployment.diagnosisSource = aiSource;
  deployment.updatedAt = new Date().toISOString();

  return { diagnosis, aiSource };
}
