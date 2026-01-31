import express from "express";
import { startMCQController,getPaidMCQs,getPurchasedMCQs,evaluateTrialResult } from "../controllers/mcq.controller.js";
import { protectUser } from "../middlewares/auth.middleware.js";
import { checkMCQAccess } from "../middlewares/checkMCQAccess.js";
import { freeTrialGuard } from "../middlewares/freeTrialGuard.js";

const router = express.Router();

// ▶️ Start MCQ
router.get("/:mcqId/start",protectUser, freeTrialGuard,checkMCQAccess,startMCQController);
// 🧪 Trial Result Evaluation
router.post("/:mcqId/trial-result",protectUser,evaluateTrialResult);
router.get("/paid", getPaidMCQs);
router.get("/purchased", protectUser, getPurchasedMCQs);


export default router;
