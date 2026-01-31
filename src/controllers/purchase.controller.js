import PurchasedSubject from "../models/PurchasedSubject.js";

/* =========================
   🔓 PURCHASE SUBJECT (TEMP / FAKE PAYMENT)
========================= */
export const purchaseSubject = async (req, res) => {
  try {
    const { subject, classLevel, amount, paymentRef } = req.body;

    if (!subject || !classLevel) {
      return res.status(400).json({
        message: "Subject and classLevel are required",
      });
    }

    // 🔒 Already purchased?
    const exists = await PurchasedSubject.findOne({
      student: req.user._id,
      subject,
      classLevel: Number(classLevel),
    });

    if (exists) {
      return res.status(200).json({
        success: true,
        unlocked: true,
        message: "Subject already unlocked",
      });
    }

    await PurchasedSubject.create({
      student: req.user._id,
      subject,
      classLevel: Number(classLevel),
      amount: Number(amount) || 100, // 🔥 default price
      paymentRef: paymentRef || "FAKE_PAYMENT",
    });

    res.status(201).json({
      success: true,
      unlocked: true,
      message: "Subject unlocked successfully",
    });
  } catch (error) {
    console.error("purchaseSubject error:", error);
    res.status(500).json({
      message: "Failed to unlock subject",
    });
  }
};

/* =========================
   🔍 CHECK SUBJECT PURCHASE
========================= */
export const checkSubjectPurchase = async (req, res) => {
  try {
    const { subject, classLevel } = req.query;

    if (!subject || !classLevel) {
      return res.status(400).json({
        message: "Subject and classLevel are required",
      });
    }

    const purchased = await PurchasedSubject.findOne({
      student: req.user._id,
      subject,
      classLevel: Number(classLevel),
    });

    res.json({
      unlocked: !!purchased,
    });
  } catch (error) {
    console.error("checkSubjectPurchase error:", error);
    res.status(500).json({
      message: "Failed to check subject purchase",
    });
  }
};
