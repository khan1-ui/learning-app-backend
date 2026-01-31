import Quiz from "../models/Quiz.js";
import PurchasedMCQ from "../models/PurchasedMCQ.js";

/**
 * @desc    Start MCQ (without correct answers)
 * @route   GET /api/mcq/:mcqId/start
 * @access  Student (Protected + Purchased)
 */
export const startMCQController = async (req, res) => {
  try {
    const { mcqId } = req.params;

    const mcq = await Quiz.findById(mcqId).lean();
    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    // ❌ Never send correct answers
    mcq.questions = mcq.questions.map(({ correctAnswer, ...q }) => q);

    // 🧪 Trial mode → limit questions
    if (req.trialLimit) {
      mcq.questions = mcq.questions.slice(0, req.trialLimit);
      mcq.isTrial = true;
      mcq.trialLimit = req.trialLimit;
    }

    res.status(200).json({
      success: true,
      data: mcq,
    });
  } catch (error) {
    console.error("❌ startMCQController error:", error);
    res.status(500).json({ message: "Failed to start MCQ" });
  }
};
export const getPaidMCQs = async (req, res) => {
  const { classLevel, subject } = req.query;

  const mcqs = await Quiz.find({
    isPaid: true,
    classLevel,
    subject,
    isPublished: true,
  });

  res.json(mcqs);
};
export const getPurchasedMCQs = async (req, res) => {
  const purchased = await PurchasedMCQ.find({
    student: req.user._id,
  }).select("mcq");

  res.json(purchased.map(p => p.mcq.toString()));
};
/**
 * @desc    Evaluate Trial MCQ Result (no DB save)
 * @route   POST /api/mcq/:mcqId/trial-result
 * @access  Student (Protected)
 */
export const evaluateTrialResult = async (req, res) => {
  try {
    const { mcqId } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Answers object is required",
      });
    }

    const mcq = await Quiz.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    mcq.questions.forEach((q) => {
      if (answers[q._id] !== undefined) {
        attempted++;
        if (Number(answers[q._id]) === Number(q.correctAnswer)) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const total = mcq.questions.length;
    const percentage =
      total > 0 ? Math.round((correct / total) * 100) : 0;

    res.status(200).json({
      total,
      attempted,
      correct,
      wrong,
      percentage,
      isTrial: true,
    });
  } catch (error) {
    console.error("❌ evaluateTrialResult error:", error);
    res.status(500).json({
      message: "Failed to evaluate trial result",
    });
  }
};