import { Router } from "express";
import { asyncHandler } from "../middleware/validation.js";
import { listProjects, listDeployments } from "../zerops/deploymentService.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const projects = listProjects();
    const deployments = listDeployments();
    const withStats = projects.map((p) => {
      const deploys = deployments.filter((d) => d.projectId === p.id);
      const successCount = deploys.filter((d) => d.stage === "live").length;
      return {
        ...p,
        deploymentCount: deploys.length,
        successCount,
        latestStage: deploys[0]?.stage ?? "queued",
      };
    });
    res.json({ projects: withStats });
  })
);

export default router;
