import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../middleware/validation.js";
import { ArchitectureSchema } from "../ai/schemas/architecture.js";
import { createDeployment, getDeployment, listDeployments, retryDeployment } from "../zerops/deploymentService.js";
import { verifyDeployment } from "../zerops/verificationService.js";
import { diagnoseDeployment } from "../zerops/diagnosisService.js";
import { validateArchitecture } from "../zerops/validationService.js";
import { AppError } from "../utils/AppError.js";

const router = Router();

const CreateDeploymentBody = z.object({
  architecture: ArchitectureSchema,
  simulateFailure: z.enum(["none", "missing_dependency", "health_check_failure", "db_connection_failure"]).default("none"),
});

router.post(
  "/",
  validateBody(CreateDeploymentBody),
  asyncHandler(async (req, res) => {
    const { architecture, simulateFailure } = req.body as z.infer<typeof CreateDeploymentBody>;

    const validation = validateArchitecture(architecture);
    if (!validation.valid) {
      throw new AppError(400, "INVALID_ARCHITECTURE", "Cannot deploy an architecture that fails validation.", validation.issues);
    }

    const deployment = createDeployment(architecture, simulateFailure);
    res.status(201).json({ deployment });
  })
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ deployments: listDeployments() });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const deployment = getDeployment(req.params.id);
    res.json({ deployment });
  })
);

router.get(
  "/:id/logs",
  asyncHandler(async (req, res) => {
    const deployment = getDeployment(req.params.id);
    const stream = req.query.stream as string | undefined;
    const logs = stream ? deployment.logs.filter((l) => l.stream === stream) : deployment.logs;
    res.json({ logs });
  })
);

router.get(
  "/:id/events",
  asyncHandler(async (req, res) => {
    const deployment = getDeployment(req.params.id);
    res.json({ events: deployment.events });
  })
);

router.get(
  "/:id/verify",
  asyncHandler(async (req, res) => {
    const deployment = getDeployment(req.params.id);
    if (!["healthy", "live", "failed"].includes(deployment.stage)) {
      throw new AppError(409, "DEPLOYMENT_NOT_READY", "Deployment must reach a terminal or health-check stage before it can be verified.");
    }
    const verification = await verifyDeployment(deployment);
    deployment.verification = verification;
    res.json({ verification });
  })
);

router.post(
  "/:id/diagnose",
  asyncHandler(async (req, res) => {
    const deployment = getDeployment(req.params.id);
    const result = await diagnoseDeployment(deployment);
    res.json(result);
  })
);

router.post(
  "/:id/retry",
  asyncHandler(async (req, res) => {
    const deployment = retryDeployment(req.params.id);
    res.status(201).json({ deployment });
  })
);

export default router;
