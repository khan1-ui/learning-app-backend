import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 👤 Who is paying
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📚 What is being purchased (SUBJECT-BASED)
    classLevel: {
      type: Number,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    // 💰 Payment info
    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
    },

    // 🔑 SSLCommerz transaction reference
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentMethod: {
      type: String, // e.g. BKASH / NAGAD / VISA
    },

    // 🧾 Optional: gateway raw response (for debugging / audit)
    gatewayResponse: {
      type: Object,
    },
  },
  { timestamps: true }
);

// 🚀 Helpful index (student dashboard, analytics)
orderSchema.index({ student: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
