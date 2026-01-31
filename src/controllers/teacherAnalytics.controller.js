import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";

export const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.teacher._id;

    // Teacher quizzes
    const quizzes = await Quiz.find({ teacher: teacherId });
    const quizIds = quizzes.map(q => q._id);

    // Results for teacher quizzes
    const results = await Result.find({ quiz: { $in: quizIds } });

    const totalQuizzes = quizzes.length;
    const totalAttempts = results.length;

    let totalScore = 0;
    let totalQuestions = 0;
    let passCount = 0;

    results.forEach(r => {
      totalScore += r.score;
      totalQuestions += r.totalQuestions;
      if (r.percentage >= 40) passCount++;
    });

    const averageScore =
      totalQuestions > 0
        ? Math.round((totalScore / totalQuestions) * 100)
        : 0;

    const passRate =
      totalAttempts > 0
        ? Math.round((passCount / totalAttempts) * 100)
        : 0;

    // Recent attempts
    const recentAttempts = await Result.find({ quiz: { $in: quizIds } })
      .populate("quiz", "title classLevel")
      .populate("student", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalQuizzes,
      totalAttempts,
      averageScore,
      passRate,
      recentAttempts,
    });
  } catch (error) {
    console.error("Teacher analytics error:", error);
    res.status(500).json({ message: "Analytics fetch failed" });
  }
};
