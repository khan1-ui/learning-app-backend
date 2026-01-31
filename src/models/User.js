import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ---------------- ROLE ---------------- */
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
      required: true,
    },

    /* ---------------- AUTH ---------------- */

    // Student uses name
    name: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "student";
      },
    },

    // Teacher uses email
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // 👈 allow null for students
      required: function () {
        return this.role === "teacher";
      },
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔐 never expose password
    },

    /* ---------------- STUDENT ONLY ---------------- */
    classLevel: {
      type: Number,
      min: 6,
      max: 10,
      required: function () {
        return this.role === "student";
      },
    },

    /* ---------------- PROFILE ---------------- */
    phone: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: null,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
