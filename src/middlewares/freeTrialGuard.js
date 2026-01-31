import PurchasedMCQ from "../models/PurchasedMCQ.js";
import Quiz from "../models/Quiz.js";

const TRIAL_QUESTION_LIMIT = 5;

export const freeTrialGuard = async (req, res, next) => {
  try {
    const { mcqId } = req.params;
    const isTrial = req.query.trial === "true";

    const mcq = await Quiz.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    // 🆓 Free MCQ → no limit
    if (!mcq.isPaid) {
      return next();
    }

    // 🔓 Paid MCQ but NOT trial → must be purchased
    if (!isTrial) {
      return next(); // checkMCQAccess will handle purchase
    }

    // 🔒 Trial requested → check if already purchased
    const purchased = await PurchasedMCQ.findOne({
      student: req.user._id,
      mcq: mcqId,
    });

    // Purchased → full access
    if (purchased) {
      return next();
    }

    // ❗ Trial allowed but limited
    req.trialLimit = TRIAL_QUESTION_LIMIT;
    return next();
  } catch (error) {
    console.error("❌ freeTrialGuard error:", error);
    return res.status(500).json({ message: "Trial check failed" });
  }
};
