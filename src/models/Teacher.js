import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    subject: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: { type: String, default: "teacher" },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

teacherSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Teacher", teacherSchema);
