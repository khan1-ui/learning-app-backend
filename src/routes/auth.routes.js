import express from "express";
import {
  registerUser,
  loginUser,
  teacherLogin,
  teacherRegister,
} from "../controllers/auth.controller.js";

const router = express.Router();

/* ==========================
   STUDENT AUTH
========================== */
router.post("/student/register", registerUser);
router.post("/student/login", loginUser);

/* ==========================
   TEACHER AUTH
========================== */
router.post("/teacher/register", teacherRegister);
router.post("/teacher/login", teacherLogin);

export default router;
