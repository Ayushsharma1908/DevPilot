import type { Architecture, Diagnosis } from "../ai/schemas/architecture.js";

export type PipelineStage = "queued" | "building" | "deploying" | "starting" | "health_check" | "healthy" | "live" | "failed";

export interface LogLine {
  ts: string;
  stream: "build" | "runtime";
  severity: "info" | "warn" | "error";
  message: string;
}

export interface DeploymentEvent {
  ts: string;
  type: string;
  message: string;
}

export interface VerificationResult {
  serviceExists: boolean;
  deploymentCompleted: boolean;
  isRunning: boolean;
  healthCheckPassed: boolean;
  httpReachable: boolean;
  noCriticalRecentErrors: boolean;
  verifiedAt: string;
  passed: boolean;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  architecture: Architecture;
  importYaml: string;
  zeropsYaml: string;
  stage: PipelineStage;
  demoMode: boolean;
  createdAt: string;
  updatedAt: string;
  liveUrl?: string;
  zeropsServices?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  logs: LogLine[];
  events: DeploymentEvent[];
  verification?: VerificationResult;
  diagnosis?: Diagnosis;
  diagnosisSource?: "gemini" | "mock";
  failureStage?: PipelineStage;
  simulatedFailure?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  deploymentIds: string[];
}
