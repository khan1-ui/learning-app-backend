import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
   explanation: { type: String, required: true }
});

const quizSchema = new mongoose.Schema(
  {
    // ---------- BASIC ----------
    title: { type: String, required: true }, 
    classLevel: { type: Number, required: true },

    // ---------- SUBJECT LEVEL ----------
    subject: {
      type: String,
      required: true,
      index: true, // 🔥 very important
      // e.g. "বাংলা ১ম পত্র"
    },

    // ---------- CHAPTER LEVEL ----------
    chapterNo: {
      type: Number,
      required: true,
      // e.g. 1, 2, 3
    },

    chapterTitle: {
      type: String,
      required: true,
      // e.g. "অধ্যায় ০১: ভাষা ও সাহিত্য"
    },

    // ---------- TYPE ----------
    isPaid: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },

    // ---------- CONTENT ----------
    duration: { type: Number, required: true }, // seconds
    questions: [questionSchema],

    // ---------- OWNER ----------
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
