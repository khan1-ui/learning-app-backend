import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    classLevel: { type: Number, required: true }, // 6-10
    name: { type: String, required: true },
  },
  { timestamps: true }
);
subjectSchema.index({ classLevel: 1, name: 1 }, { unique: true });

export default mongoose.model("Subject", subjectSchema);
