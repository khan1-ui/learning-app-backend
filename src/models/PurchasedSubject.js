import mongoose from "mongoose";

const purchasedSubjectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classLevel: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    paymentRef: {
      type: String, // SSLCommerz tran_id
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔒 One subject only once per student
purchasedSubjectSchema.index(
  { student: 1, classLevel: 1, subject: 1 },
  { unique: true }
);

export default mongoose.model("PurchasedSubject", purchasedSubjectSchema);
