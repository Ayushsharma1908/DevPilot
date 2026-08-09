import { Router } from "express";
import { asyncHandler, validateBody } from "../middleware/validation.js";
import { ArchitectureSchema } from "../ai/schemas/architecture.js";
import { generateImportYaml } from "../zerops/importService.js";
import { generateZeropsYaml } from "../zerops/configService.js";
import { validateArchitecture, validateYamlSyntax } from "../zerops/validationService.js";

const router = Router();

router.post(
  "/generate",
  validateBody(ArchitectureSchema),
  asyncHandler(async (req, res) => {
    const architecture = req.body;
    const importYaml = generateImportYaml(architecture);
    const zeropsYaml = generateZeropsYaml(architecture);
    res.json({ importYaml, zeropsYaml });
  })
);

router.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const { architecture, importYaml, zeropsYaml } = req.body ?? {};
    const issues = [];

    if (architecture) {
      const parsed = ArchitectureSchema.safeParse(architecture);
      if (!parsed.success) {
        issues.push({ field: "architecture", message: "Architecture failed schema validation.", severity: "error" as const });
      } else {
        issues.push(...validateArchitecture(parsed.data).issues);
      }
    }
    if (typeof importYaml === "string") issues.push(...validateYamlSyntax("importYaml", importYaml));
    if (typeof zeropsYaml === "string") issues.push(...validateYamlSyntax("zeropsYaml", zeropsYaml));

    res.json({ validation: { valid: !issues.some((i) => i.severity === "error"), issues } });
  })
);

export default router;
