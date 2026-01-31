import express from "express";
import Result from "../models/Result.js";
import Quiz from "../models/Quiz.js";
import { protectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/subjects", protectUser, async (req, res) => {
  try {
    const studentId = req.user._id;

    // 🔥 Only FULL quiz results (trial বাদ)
    const results = await Result.find({
      student: studentId,
      isTrial: false,
    }).populate("quiz");

    const progressMap = {};

    for (const r of results) {
      // 🔒 SAFETY: quiz missing হলে skip
      if (!r.quiz) continue;

      const { subject, classLevel } = r.quiz;
      if (!subject || !classLevel) continue;

      const key = `${classLevel}-${subject}`;

      // INIT
      if (!progressMap[key]) {
        const totalChapters = await Quiz.countDocuments({
          classLevel,
          subject,
          isPublished: true,
        });

        progressMap[key] = {
          subject,
          classLevel,
          completed: new Set(),
          total: totalChapters || 0,
        };
      }

      // completed chapter
      progressMap[key].completed.add(
        r.quiz._id.toString()
      );
    }

    // FORMAT RESPONSE
    const response = Object.values(progressMap).map(
      (p) => ({
        subject: p.subject,
        classLevel: p.classLevel,
        completed: p.completed.size,
        total: p.total,
        percentage:
          p.total > 0
            ? Math.round(
                (p.completed.size / p.total) * 100
              )
            : 0,
      })
    );

    res.json(response);
  } catch (err) {
    console.error("❌ progress/subjects error:", err);
    res.status(500).json({
      message: "Failed to load subject progress",
    });
  }
});

export default router;
