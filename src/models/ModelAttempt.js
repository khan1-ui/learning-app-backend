import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    classLevel: {
      type: Number,
      required: true,
    },

    totalQuestions: Number,
    correct: Number,
    wrong: Number,
    percentage: Number,
answers: [
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,   // 🔥 MUST
    },
    question: String,
    selectedOption: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    explanation: String,
  },
],



    isTrial: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ModelAttempt", attemptSchema);
