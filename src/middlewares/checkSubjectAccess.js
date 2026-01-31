import PurchasedSubject from "../models/PurchasedSubject.js";

export const checkSubjectAccess = async (req, res, next) => {
  const { subject, classLevel } = req.query;

  const purchased = await PurchasedSubject.findOne({
    student: req.user._id,
    subject,
    classLevel,
  });

  if (!purchased) {
    return res.status(403).json({
      message: "Please purchase this subject to continue",
    });
  }

  next();
};
