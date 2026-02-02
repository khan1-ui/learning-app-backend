import express from "express";
import { protectTeacher } from "../middlewares/auth.middleware.js";
import { getTeacherAnalytics } from "../controllers/teacherAnalytics.controller.js";
import { createTeacherProfile,updateTeacherProfile } from "../controllers/teacherController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// POST /api/teachers/profile
router.post(
  "/profile",
  protectTeacher,
  upload.single("avatar"),
  createTeacherProfile
);
router.put(
  "/profile",
  protectTeacher,
  upload.single("avatar"),
  updateTeacherProfile
);


router.get("/analytics", protectTeacher, getTeacherAnalytics);
export default router;
