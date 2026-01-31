import express from "express";
import { createChapter, getChaptersBySubject } from "../controllers/chapter.controller.js";
import { protectTeacher } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protectTeacher, createChapter); // only logged in teacher
router.get("/:subjectId", getChaptersBySubject);

export default router;
