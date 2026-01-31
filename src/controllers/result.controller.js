import Result from "../models/Result.js";
import Quiz from "../models/Quiz.js";
import ModelAttempt from "../models/ModelAttempt.js";

/**
 * @desc    Submit Quiz Result (Auto Calculation)
 * @route   POST /api/results
 * @access  Student (Protected)
 */
export const submitResult = async (req, res) => {
  try {
    const { quizId, answers, timeTaken, isTrial = false } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "quizId and answers are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const TRIAL_LIMIT = 5;

    // 🔥 CORE POLICY
    const sourceQuestions = isTrial
      ? quiz.questions.slice(0, TRIAL_LIMIT)
      : quiz.questions;

    let correct = 0;

    const evaluatedAnswers = sourceQuestions.map((q) => {
      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(q._id)
      );

      const selectedOption =
        userAnswer?.selectedOption !== undefined
          ? Number(userAnswer.selectedOption)
          : null;

      const isCorrect =
        selectedOption !== null &&
        selectedOption === Number(q.correctAnswer);

      if (isCorrect) correct++;

      return {
        questionId: q._id,
        question: q.question,
        selectedOption,
        correctAnswer: Number(q.correctAnswer),
        isCorrect,
        explanation: q.explanation || "",
      };
    });

    const totalQuestions = sourceQuestions.length;
    const wrong = totalQuestions - correct;
    const percentage = Math.round((correct / totalQuestions) * 100);

    /* =========================
       🆓 TRIAL → ONLY ATTEMPT
    ========================== */
    if (isTrial) {
      await ModelAttempt.create({
        student: req.user._id,
        quiz: quizId,
        subject: quiz.subject,
        classLevel: quiz.classLevel,
        totalQuestions,
        correct,
        wrong,
        percentage,
        answers: evaluatedAnswers,
        isTrial: true,
      });

      return res.status(201).json({
        success: true,
        isTrial: true,
        totalQuestions,
        correct,
        wrong,
        percentage,
      });
    }

    /* =========================
       🔐 FULL QUIZ → RESULT + ATTEMPT
    ========================== */
    const existingResult = await Result.findOne({
      student: req.user._id,
      quiz: quizId,
    });

    if (existingResult) {
      return res.status(400).json({
        message: "You have already submitted this quiz",
      });
    }

    const result = await Result.create({
      student: req.user._id,
      quiz: quizId,
      totalQuestions,
      correctAnswers: correct,
      wrongAnswers: wrong,
      score: correct,
      percentage,
      timeTaken: timeTaken || 0,
      isTrial: false,
    });

    await ModelAttempt.create({
      student: req.user._id,
      quiz: quizId,
      subject: quiz.subject,
      classLevel: quiz.classLevel,
      totalQuestions,
      correct,
      wrong,
      percentage,
      answers: evaluatedAnswers,
      isTrial: false,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ submitResult error:", error);
    res.status(500).json({ message: "Failed to submit result" });
  }
};

/**
 * @desc    Get all results of logged-in student
 * @route   GET /api/results
 * @access  Student (Protected)
 */
export const getUserResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate({
        path: "quiz",
        select: "title classLevel subject",
      })
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    console.error("getUserResults error:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

/**
 * @desc    Get single quiz result for logged-in student
 * @route   GET /api/results/:quizId
 * @access  Student (Protected)
 */
export const getSingleResult = async (req, res) => {
  try {
    const { quizId } = req.params;

    const result = await Result.findOne({
      quiz: quizId,
      student: req.user._id,
    }).populate({
      path: "quiz",
      select: "title classLevel subject",
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("getSingleResult error:", error);
    res.status(500).json({ message: "Failed to fetch result" });
  }
};
/**
 * @desc    Get Top 10 Leaderboard for a Quiz
 * @route   GET /api/results/leaderboard/:quizId
 * @access  Public / Protected (your choice)
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const leaderboard = await Result.find({ quiz: quizId })
      .populate({
        path: "student",
        select: "name roll",
      })
      .sort({
        score: -1,
        percentage: -1,
        timeTaken: 1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    console.error("❌ getLeaderboard error:", error);
    res.status(500).json({
      message: "Failed to fetch leaderboard",
    });
  }
};
// GET wrong answer explanations
export const getWrongExplanations = async (req, res) => {
  try {
    const { quizId } = req.params;
    const isTrial = req.query.trial === "true";

    const attempt = await ModelAttempt.findOne({
      quiz: quizId,
      student: req.user._id,
      ...(isTrial ? { isTrial: true } : {}),
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.json({ isTrial, data: [] });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.json({ isTrial, data: [] });
    }

    const wrongAnswers = attempt.answers.filter(
      (a) => a.isCorrect === false
    );

    const data = wrongAnswers.map((a) => {
      const fullQuestion = quiz.questions.find(
        (q) => String(q._id) === String(a.questionId)
      );

      return {
        question: fullQuestion?.question || a.question,
        options: fullQuestion?.options || [],
        selectedOption: a.selectedOption,
        correctAnswer: a.correctAnswer,
        explanation:
          fullQuestion?.explanation || a.explanation || "",
      };
    });

    res.json({
      success: true,
      isTrial,
      data,
    });
  } catch (err) {
    console.error("❌ getWrongExplanations error:", err);
    res.status(500).json({
      message: "Failed to load wrong answers",
    });
  }
};



export const getLatestAttemptResult = async (req, res) => {
  try {
    const { quizId } = req.params;
    const isTrial = req.query.trial === "true";

    const attempt = await ModelAttempt.findOne({
      quiz: quizId,
      student: req.user._id,
      ...(isTrial ? { isTrial: true } : {}),
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found",
      });
    }

    res.json({
      isTrial: attempt.isTrial,
      totalQuestions: attempt.answers.length,
      correct: attempt.correct,
      wrong: attempt.wrong,
      percentage: attempt.percentage,
    });
  } catch (err) {
    console.error("getLatestAttemptResult error:", err);
    res.status(500).json({
      message: "Failed to load attempt result",
    });
  }
};


