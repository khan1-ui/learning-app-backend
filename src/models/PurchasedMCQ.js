import mongoose from "mongoose";

const purchasedMCQSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mcq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz", // quiz model থাকলেও conceptually MCQ
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ❗ same MCQ twice purchase prevent
purchasedMCQSchema.index(
  { student: 1, mcq: 1 },
  { unique: true }
);

export default mongoose.model("PurchasedMCQ", purchasedMCQSchema);
