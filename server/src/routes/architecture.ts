import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../middleware/validation.js";
import { generateArchitecture } from "../ai/geminiService.js";
import { ArchitectureSchema } from "../ai/schemas/architecture.js";
import { validateArchitecture } from "../zerops/validationService.js";

const router = Router();

const AnalyzeBody = z.object({
  description: z.string().min(5).max(2000),
});

router.post(
  "/analyze",
  validateBody(AnalyzeBody),
  asyncHandler(async (req, res) => {
    const { description } = req.body as z.infer<typeof AnalyzeBody>;
    const { architecture, aiSource } = await generateArchitecture(description);
    const validation = validateArchitecture(architecture);
    res.json({ architecture, aiSource, validation });
  })
);

router.post(
  "/validate",
  validateBody(ArchitectureSchema),
  asyncHandler(async (req, res) => {
    const architecture = req.body;
    const validation = validateArchitecture(architecture);
    res.json({ validation });
  })
);

export default router;
