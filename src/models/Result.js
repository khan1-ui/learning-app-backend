import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOption: {
      type: Number,
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
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

    // Question-wise review
    answers: {
      type: [answerSchema],
      required: true,
    },

    // 🔢 Marks & Stats
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    wrongAnswers: {
      type: Number,
      required: true,
    },
    score: {
      type: Number, // total marks
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    // ⏳ Trial or Paid Attempt
      isTrial: {
        type: Boolean,
        default: false,
      },


    // ⏱️ For leaderboard tie-break
    timeTaken: {
      type: Number, // seconds
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
