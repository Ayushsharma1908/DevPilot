import { Router } from "express";
import { isDemoMode } from "../zerops/deploymentService.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    demoMode: isDemoMode(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

export default router;
