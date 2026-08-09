import { spawn } from "node:child_process";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

function runZcli(
  args: string[],
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("zcli", args, {
      cwd,
      env: process.env,
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });

    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    child.on("error", (err) => {
      reject(
        new AppError(
          503,
          "ZCLI_UNAVAILABLE",
          "zcli is not available on PATH.",
          { message: err.message }
        )
      );
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new AppError(
            502,
            "ZCLI_COMMAND_FAILED",
            `zcli ${args.join(" ")} failed with code ${code}`,
            { stdout, stderr }
          )
        );
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

export function assertRealModeConfigured() {
  if (!process.env.ZEROPS_TOKEN) {
    throw new AppError(
      501,
      "ZEROPS_NOT_CONFIGURED",
      "ZEROPS_TOKEN is required for real Zerops deployment."
    );
  }
}

export async function projectImport(
  importYamlPath: string,
  orgId?: string
) {
  assertRealModeConfigured();

  const args = ["project", "project-import", importYamlPath];

  if (orgId) {
    args.push("--org-id", orgId);
  }

  logger.info("Creating Zerops project", { args });

  return runZcli(args);
}

export async function servicePush(
  serviceId: string,
  workingDir: string,
  projectId?: string
) {
  assertRealModeConfigured();

  const args = [
    "service",
    "push",
    serviceId,
    "--working-dir",
    workingDir,
  ];

  if (projectId) {
    args.push("--project-id", projectId);
  }

  logger.info("Pushing service to Zerops", {
    serviceId,
    workingDir,
  });

  return runZcli(args);
}

export async function serviceList(projectId: string) {
  assertRealModeConfigured();

  const args = [
    "service",
    "list",
    "--project-id",
    projectId,
  ];

  logger.info("zcli service list", { args });

  return runZcli(args);
}
export async function serviceLog(
  serviceId: string,
  projectId?: string
) {
  assertRealModeConfigured();

  const args = [
    "service",
    "log",
    "--service-id",
    serviceId,
    "--limit",
    "100",
  ];

  if (projectId) {
    args.push("--project-id", projectId);
  }

  return runZcli(args);
}

export async function enableSubdomain(
  serviceId: string,
  projectId?: string
) {
  assertRealModeConfigured();

  const args = [
    "service",
    "enable-subdomain",
    serviceId,
  ];

  if (projectId) {
    args.push("--project-id", projectId);
  }

  return runZcli(args);
}

