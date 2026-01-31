import express from "express";
import { protectTeacher, protectUser } from "../middlewares/auth.middleware.js";
import {
  createQuiz,
  importQuizFromJSON,
  togglePublish,
  deleteQuiz,
  getTeacherQuizzes,
  quizAnalytics,

  getFreeModels,
  getPaidSubjects,
  getPaidModels,

  canAttemptQuiz,
  getQuizById,
} from "../controllers/quiz.controller.js";

const router = express.Router();

/* =========================
   🧑‍🏫 TEACHER ROUTES
========================= */
 
// Create quiz manually
router.post("/", protectTeacher, createQuiz);

// Import quiz via JSON
router.post("/import", protectTeacher, importQuizFromJSON);

// Get teacher quizzes
router.get("/teacher", protectTeacher, getTeacherQuizzes);

// Publish / Unpublish
router.patch("/:id/publish", protectTeacher, togglePublish);

// Delete quiz
router.delete("/:id", protectTeacher, deleteQuiz);

// Quiz analytics
router.get("/analytics/:quizId", protectTeacher, quizAnalytics);

/* =========================
   🎓 STUDENT ROUTES
========================= */

// 🆓 Free models (trial)
router.get("/free", protectUser, getFreeModels);

// 💰 Paid subjects (বাংলা ১ম পত্র, গণিত…)
router.get("/paid/subjects", protectUser, getPaidSubjects);

// 📘 Paid chapters under a subject
router.get("/paid/models", protectUser, getPaidModels);

/* =========================
   ▶️ QUIZ ATTEMPT (ALWAYS LAST)
========================= */

// Get quiz by ID (with trial / paid check)
router.get("/:id", protectUser, canAttemptQuiz, getQuizById);

export default router;
