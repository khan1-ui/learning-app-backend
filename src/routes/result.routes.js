import express from "express";
import {
  submitResult,
  getUserResults,
  getSingleResult,
  getLeaderboard,
  getWrongExplanations,
  getLatestAttemptResult
} from "../controllers/result.controller.js";
import { protectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// submit
router.post("/", protectUser, submitResult);

// get all results
router.get("/", protectUser, getUserResults);

// leaderboard (⚠️ before :quizId)
router.get("/leaderboard/:quizId", getLeaderboard);
 /*  🔥 TRIAL RESULT (IMPORTANT)
========================= */
router.get("/attempt/:quizId",protectUser,getLatestAttemptResult);


router.get("/:quizId/explanations",protectUser,getWrongExplanations);



// single result
router.get("/:quizId", protectUser, getSingleResult);

export default router;
