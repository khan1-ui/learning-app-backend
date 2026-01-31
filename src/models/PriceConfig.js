import mongoose from "mongoose";

const priceConfigSchema = new mongoose.Schema(
  {
    classLevel: {
      type: Number,
      required: true,
      min: 6,
      max: 10,
    },
    subject: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// 🔒 one price per class + subject
priceConfigSchema.index(
  { classLevel: 1, subject: 1 },
  { unique: true }
);

export default mongoose.model("PriceConfig", priceConfigSchema);
