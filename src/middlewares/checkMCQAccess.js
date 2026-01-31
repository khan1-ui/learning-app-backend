import PurchasedMCQ from "../models/PurchasedMCQ.js";
import Quiz from "../models/Quiz.js";

export const checkMCQAccess = async (req, res, next) => {
  const { mcqId } = req.params;
  const isTrial = req.query.trial === "true";
  console.log("isTrial:", req.query.trial);

  const mcq = await Quiz.findById(mcqId);
  if (!mcq) {
    return res.status(404).json({ message: "MCQ not found" });
  }

  // 🆓 Free MCQ → allow
  if (!mcq.isPaid) {
    console.log("isPaid:", mcq.isPaid);
    return next();
  }

  // 🧪 Trial mode → allow (limit already applied)
  if (isTrial) {
    return next();
  }

  // 🔐 Paid + not trial → must be purchased
  const purchased = await PurchasedMCQ.findOne({
    student: req.user._id,
    mcq: mcqId,
  });

  if (!purchased) {
    console.log("purchased:", !!purchased);
    return res.status(403).json({
      message: "Please purchase this MCQ to access",
    });
  }

  next();
};



