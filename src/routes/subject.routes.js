import express from "express";
import PurchasedSubject from "../models/PurchasedSubject.js";
import { createSubject, getSubjects } from "../controllers/subject.controller.js";
import { protectTeacher } from "../middlewares/auth.middleware.js";
import { protectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/purchased", protectUser, async (req, res) => {
  const { classLevel } = req.query;

  const purchased = await PurchasedSubject.find({
    student: req.user._id,
    classLevel,
  }).select("subject");

  res.json(purchased.map((p) => p.subject));
});
router.post("/", protectTeacher, createSubject); // only logged in teacher
router.get("/", getSubjects);
router.get("/check", protectUser, async (req, res) => {
  const { classLevel, subject } = req.query;

  const purchased = await PurchasedSubject.findOne({
    student: req.user._id,
    classLevel,
    subject,
  });

  res.json({ unlocked: !!purchased });
});


export default router;
